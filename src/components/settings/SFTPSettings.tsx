
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Server, Key, Copy, RefreshCw, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';

// API Configuration
const API_BASE = "http://136.0.3.22:8000";
const PREFIX = "/api/v1";

// Type definitions matching your API contracts
type Provision = {
  success: boolean;
  credentials: { 
    host: string; 
    port: number; 
    username: string; 
    password: string; 
    folder_path: string 
  };
  account: { 
    telegram_id: string | number; 
    ftp_username: string;
    ftp_folder_path: string;
    status: "active" | "inactive";
    created_at: string;
    expires_at: string;
  };
};

type TestResult = { 
  status: "success" | "failed" | "pending"; 
  last_event?: string 
};

// Connection result callback type
type ConnectionResultCallback = (status: "success" | "failed" | "pending", details: any) => void;

interface SFTPSettingsProps {
  onConnectionResult?: ConnectionResultCallback;
}

export function SFTPSettings({ onConnectionResult }: SFTPSettingsProps = {}) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [creds, setCreds] = useState<Provision["credentials"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(true);

  // Get Telegram ID from WebApp context
  function tgId(): string {
    const tg = (window as any).Telegram?.WebApp?.initDataUnsafe;
    return String(tg?.user?.id ?? tg?.user?.user_id ?? "");
  }

  // Simple fetch wrapper
  async function post<T>(path: string, body: any): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    
    console.log('🚀 SFTP: Making request to:', `${API_BASE}${PREFIX}${path}`);
    console.log('🚀 SFTP: Request body:', body);
    
    const response = await fetch(`${API_BASE}${PREFIX}${path}`, { 
      method: "POST", 
      headers, 
      body: JSON.stringify(body) 
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => `HTTP ${response.status}`);
      console.error('❌ SFTP: Request failed:', response.status, errorText);
      throw new Error(errorText);
    }
    
    const result = await response.json();
    console.log('✅ SFTP: Response received:', result);
    return result as T;
  }

  // Test connection once
  async function testOnce(telegram_id: string): Promise<TestResult> {
    console.log('🔍 SFTP: Testing connection for user:', telegram_id);
    return post<TestResult>("/sftp/test-connection", { telegram_id });
  }

  // Poll test connection with retries
  async function pollTest(telegram_id: string, tries = 6, waitMs = 1200) {
    console.log('🔍 SFTP: Starting connection test polling...');
    setStatus("pending");
    
    for (let i = 0; i < tries; i++) {
      try {
        const result = await testOnce(telegram_id);
        console.log(`🔍 SFTP: Test attempt ${i + 1}/${tries}:`, result);
        
        if (result.status === "success") {
          setStatus("success");
          setPasswordVisible(false); // Hide password on success
          setLocked(true);
          
          // Invoke callback
          onConnectionResult?.("success", result);
          
          toast({
            title: "✅ SFTP חיבור מוצלח",
            description: `מחובר לשרת ${creds?.host}. העלה קבצים ל-/inbox`,
          });
          return;
        }
        
        if (result.status === "failed") {
          setStatus("failed");
          setPasswordVisible(false); // Hide password on failure
          setLocked(true);
          setError(result.last_event || "Connection failed");
          
          // Invoke callback
          onConnectionResult?.("failed", result);
          
          toast({
            title: "❌ בדיקת חיבור נכשלה",
            description: result.last_event || "לא ניתן להתחבר לשרת SFTP",
            variant: "destructive",
          });
          return;
        }
        
        // Still pending, wait and try again
        if (i < tries - 1) {
          await new Promise(resolve => setTimeout(resolve, waitMs));
        }
        
      } catch (error) {
        console.error('❌ SFTP: Connection test error:', error);
      }
    }
    
    // Timeout reached - still pending
    setStatus("pending");
    setPasswordVisible(false); // Hide password on timeout
    setLocked(true);
    
    // Invoke callback
    onConnectionResult?.("pending", { last_event: "Connection test timed out" });
    
    toast({
      title: "⏳ בדיקת חיבור בהמתנה",
      description: "החיבור עדיין נבדק ברקע",
      variant: "default",
    });
  }

  // Generate SFTP credentials
  async function onGenerate() {
    const telegram_id = tgId();
    if (!telegram_id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לזהות את המשתמש מ-Telegram",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("idle");
    setCreds(null);
    setPasswordVisible(true);
    
    try {
      console.log('🚀 SFTP: Generating credentials for Telegram ID:', telegram_id);
      
      const data = await post<Provision>("/sftp/provision", { telegram_id });
      console.log('✅ SFTP: Credentials generated successfully');
      
      setCreds(data.credentials);
      
      toast({
        title: "🔑 פרטי SFTP נוצרו בהצלחה",
        description: "הסיסמה מוצגת פעם אחת בלבד - שמור אותה!",
      });
      
      // Start connection testing immediately
      await pollTest(telegram_id);
      
    } catch (e: any) {
      const errorMessage = e?.message || "יצירת חשבון נכשלה";
      console.error('❌ SFTP: Generation error:', errorMessage);
      
      setError(errorMessage);
      setStatus("failed");
      setLocked(true);
      
      toast({
        title: "❌ שגיאה ביצירת חשבון SFTP",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Rotate & Retry functionality
  const onRotateAndRetry = () => {
    setLocked(false);
    setStatus("idle");
    setCreds(null);
    setError(null);
    setPasswordVisible(true);
    onGenerate();
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק ללוח",
      description: `${label} הועתק בהצלחה`,
    });
  };

  // Status badge component
  const StatusBadge = () => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            מחובר
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            נכשל
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            בודק חיבור...
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          הגדרות SFTP
        </CardTitle>
        <CardDescription>
          העלאה מאובטחת; אתה מוגבל לתיקייה פרטית. העלה ל-/inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate Button */}
        <div className="space-y-4">
          <Button
            onClick={onGenerate}
            disabled={loading || locked}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                יוצר חשבון SFTP...
              </>
            ) : locked ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                חשבון נוצר
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                צור חשבון SFTP
              </>
            )}
          </Button>

          {/* Rotate & Retry Button */}
          {(status === "failed" || status === "pending") && (
            <Button
              onClick={onRotateAndRetry}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              החלף סיסמה ונסה שוב
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">שגיאה: {error}</p>
          </div>
        )}

        {/* Credentials Display */}
        {creds && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">פרטי חשבון SFTP</h3>
              <StatusBadge />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Host */}
              <div className="space-y-2">
                <Label>שרת</Label>
                <div className="flex gap-2">
                  <Input
                    value={creds.host}
                    readOnly
                    className="bg-gray-50 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(creds.host, 'כתובת השרת')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Port */}
              <div className="space-y-2">
                <Label>פורט</Label>
                <div className="flex gap-2">
                  <Input
                    value={creds.port.toString()}
                    readOnly
                    className="bg-gray-50 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(creds.port.toString(), 'הפורט')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label>שם משתמש</Label>
                <div className="flex gap-2">
                  <Input
                    value={creds.username}
                    readOnly
                    className="bg-gray-50 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(creds.username, 'שם המשתמש')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Password - shown only once */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {passwordVisible ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      סיסמה (שמור בבטחה! מוצגת פעם אחת בלבד)
                    </>
                  ) : (
                    "סיסמה"
                  )}
                </Label>
                {passwordVisible ? (
                  <div className="flex gap-2">
                    <Input
                      value={creds.password}
                      type="text"
                      readOnly
                      className="bg-amber-50 border-amber-200 font-mono text-red-600 font-bold"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(creds.password, 'הסיסמה')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg border">
                    הסיסמה הוסתרה (הוצגה פעם אחת בלבד)
                  </div>
                )}
                {passwordVisible && (
                  <p className="text-sm text-amber-600 font-medium">
                    ⚠️ זוהי הפעם האחרונה שתוכל לראות את הסיסמה!
                  </p>
                )}
              </div>

              {/* Upload Folder */}
              <div className="space-y-2">
                <Label>תיקיית העלאה</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-mono text-blue-800">העלה ל: {creds.folder_path}</p>
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">הוראות שימוש:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• השתמש בלקוח SFTP כמו FileZilla או WinSCP</li>
                <li>• העלה קבצי CSV לתיקיית {creds.folder_path}</li>
                <li>• הקבצים יעובדו אוטומטית תוך מספר דקות</li>
                <li>• תקבל הודעה כשהעיבוד יסתיים</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
