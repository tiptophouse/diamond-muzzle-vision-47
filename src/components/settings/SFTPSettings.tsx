import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Server, Key, Copy, RefreshCw, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { sftpApi, type ProvisionResponse } from '@/lib/api/sftp';
import { useTelegramSendData } from '@/hooks/useTelegramSendData';

// Connection result callback type
type ConnectionResultCallback = (status: "success" | "failed" | "pending", details: any) => void;

interface SFTPSettingsProps {
  onConnectionResult?: ConnectionResultCallback;
}

export function SFTPSettings({ onConnectionResult }: SFTPSettingsProps = {}) {
  const { toast } = useToast();
  const { sendData, reportUserAction, isAvailable: telegramAvailable } = useTelegramSendData();
  
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [creds, setCreds] = useState<ProvisionResponse["credentials"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Get Telegram ID with fallback for local dev
  function getTelegramId(): string {
    if (typeof window === 'undefined') return "2138564172";
    
    const tg = (window as any).Telegram?.WebApp?.initDataUnsafe;
    const telegramId = tg?.user?.id ?? tg?.user?.user_id;
    
    if (!telegramId) {
      console.warn('No Telegram ID found, using dev fallback');
      return "2138564172";
    }
    
    return String(telegramId);
  }

  // Send SFTP status to Telegram bot
  const sendSFTPStatusToBot = (
    status: "success" | "failed" | "pending", 
    details: any, 
    credentials?: ProvisionResponse["credentials"]
  ) => {
    const telegramId = getTelegramId();
    
    const payload = {
      action: 'sftp_result',
      data: {
        type: 'sftp_result',
        status,
        telegram_id: telegramId,
        host: credentials?.host || '136.0.3.22',
        username: credentials?.username || 'unknown',
        folder_path: credentials?.folder_path || '/inbox',
        last_event: details?.last_event || null,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };

    console.log('📤 Sending SFTP status to Telegram bot:', payload);
    
    if (telegramAvailable) {
      const success = sendData(payload);
      if (success) {
        toast({
          title: "📱 הודעה נשלחה לטלגרם",
          description: `סטטוס SFTP (${status}) נשלח לבוט`,
        });
      } else {
        console.warn('⚠️ Failed to send SFTP status to Telegram bot');
      }
    } else {
      console.warn('⚠️ Telegram WebApp not available for sending SFTP status');
    }
  };

  // Test connection with polling
  async function pollTestConnection(telegramId: string, maxTries = 6, intervalMs = 1200) {
    console.log('🔍 Starting connection test polling...');
    setStatus("pending");
    setPasswordVisible(false); // Hide password immediately when testing starts
    
    // Send pending status to bot
    sendSFTPStatusToBot("pending", { last_event: "Starting connection test" }, creds);
    
    for (let i = 0; i < maxTries; i++) {
      try {
        const result = await sftpApi.testConnection(telegramId);
        console.log(`🔍 Test attempt ${i + 1}/${maxTries}:`, result);
        
        if (result.status === "success") {
          setStatus("success");
          setLocked(true);
          
          // Send success status to bot
          sendSFTPStatusToBot("success", result, creds);
          
          onConnectionResult?.("success", result);
          
          toast({
            title: "✅ SFTP חיבור מוצלח",
            description: `מחובר לשרת ${creds?.host}. העלה קבצים ל-${creds?.folder_path}`,
          });
          return;
        }
        
        if (result.status === "failed") {
          setStatus("failed");
          setLocked(true);
          setError(result.last_event || "Connection failed");
          
          // Send failure status to bot
          sendSFTPStatusToBot("failed", result, creds);
          
          onConnectionResult?.("failed", result);
          
          toast({
            title: "❌ בדיקת חיבור נכשלה",
            description: result.last_event || "לא ניתן להתחבר לשרת SFTP",
            variant: "destructive",
          });
          return;
        }
        
        // Still pending, wait and try again
        if (i < maxTries - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        
      } catch (error) {
        console.error('❌ Connection test error:', error);
      }
    }
    
    // Timeout reached - still pending
    setStatus("pending");
    setLocked(true);
    
    // Send timeout status to bot
    sendSFTPStatusToBot("pending", { last_event: "Connection test timed out - still checking in background" }, creds);
    
    onConnectionResult?.("pending", { last_event: "Connection test timed out" });
    
    toast({
      title: "⏳ בדיקת חיבור בהמתנה",
      description: "החיבור עדיין נבדק ברקע",
      variant: "default",
    });
  }

  // Generate SFTP credentials
  async function onGenerate() {
    const telegramId = getTelegramId();

    setLoading(true);
    setError(null);
    setStatus("idle");
    setCreds(null);
    setPasswordVisible(false);
    
    // Report user action to Telegram
    reportUserAction('sftp_generate_clicked');
    
    try {
      console.log('🚀 Generating SFTP credentials for Telegram ID:', telegramId);
      
      // Test API health first
      await sftpApi.alive();
      
      const data = await sftpApi.provision(telegramId);
      console.log('✅ SFTP credentials generated successfully');
      
      setCreds(data.credentials);
      setPasswordVisible(true); // Show password ONLY on successful provision
      
      toast({
        title: "🔑 פרטי SFTP נוצרו בהצלחה",
        description: "הסיסמה מוצגת פעם אחת בלבד - שמור אותה!",
      });
      
      // Start connection testing immediately
      await pollTestConnection(telegramId);
      
    } catch (e: any) {
      const errorMessage = e?.message || "יצירת חשבון נכשלה";
      console.error('❌ SFTP Generation error:', errorMessage);
      
      setError(errorMessage);
      setStatus("failed");
      setLocked(true);
      
      // Send error status to bot
      sendSFTPStatusToBot("failed", { last_event: errorMessage });
      
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
    setPasswordVisible(false);
    
    // Report retry action
    reportUserAction('sftp_retry_clicked');
    
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

  // Check if Telegram ID is available
  const telegramId = getTelegramId();
  const isTelegramAvailable = !!telegramId;

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
          {telegramAvailable && (
            <Badge variant="outline" className="text-xs">
              📱 מחובר לטלגרם
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          העלאה מאובטחת; אתה מוגבל לתיקייה פרטית. העלה ל-/inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Telegram ID Info */}
        <div className="text-sm text-muted-foreground">
          Telegram ID: {telegramId}
        </div>

        {/* Generate Button */}
        <div className="space-y-4">
          <Button
            onClick={onGenerate}
            disabled={loading || locked || !isTelegramAvailable}
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
                <li>• תקבל הודעה בטלגרם כשהעיבוד יסתיים</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
