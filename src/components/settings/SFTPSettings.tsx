
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Server, Key, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api/auth';
import { API_BASE_URL } from '@/lib/api/config';

type Provision = {
  success: boolean;
  credentials: { 
    host: string; 
    port: number; 
    username: string; 
    password?: string; 
    folder_path: string 
  };
  account: { 
    telegram_id: string | number; 
    status: "active" | "inactive" 
  };
};

type TestResult = { 
  status: "success" | "failed" | "pending"; 
  last_event?: string 
};

export function SFTPSettings() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<"idle"|"pending"|"success"|"failed">("idle");
  const [creds, setCreds] = useState<Provision["credentials"]|null>(null);
  const [error, setError] = useState<string|null>(null);

  // Use the correct API configuration
  const apiBase = API_BASE_URL;
  const prefix = "/api/v1";

  async function post<T>(path: string, body: any): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
    };

    console.log('🚀 SFTP: Making request to:', `${apiBase}${prefix}${path}`);
    console.log('🚀 SFTP: With headers:', Object.keys(headers));
    
    const res = await fetch(`${apiBase}${prefix}${path}`, { 
      method: "POST", 
      headers, 
      body: JSON.stringify(body) 
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Request failed");
      console.error('❌ SFTP: Request failed:', res.status, errorText);
      throw new Error(errorText);
    }
    
    return res.json() as Promise<T>;
  }

  async function testOnce(telegram_id: string): Promise<TestResult> {
    console.log('🔍 SFTP: Testing connection for user:', telegram_id);
    return post<TestResult>("/sftp/test-connection", { telegram_id });
  }

  async function pollTest(telegram_id: string, tries = 6, waitMs = 1200) {
    setStatus("pending");
    
    for (let i = 0; i < tries; i++) {
      try {
        const r = await testOnce(telegram_id);
        console.log('🔍 SFTP: Test result:', r);
        
        if (r.status === "success" || r.status === "failed") {
          setStatus(r.status);
          setCreds(c => (c ? { ...c, password: undefined } : c)); // hide password
          setLocked(true); // lock UI (one-time)
          
          if (r.status === "success") {
            toast({
              title: "חיבור SFTP מוצלח",
              description: "החשבון שלך פעיל ומוכן לשימוש",
            });
          } else {
            toast({
              title: "בדיקת חיבור נכשלה",
              description: "לא ניתן להתחבר לשרת SFTP",
              variant: "destructive",
            });
          }
          return;
        }
        await new Promise(r => setTimeout(r, waitMs));
      } catch (error) {
        console.error('❌ SFTP: Connection test error:', error);
      }
    }
    
    // still pending → hide password and lock
    setStatus("pending");
    setCreds(c => (c ? { ...c, password: undefined } : c));
    setLocked(true);
    
    toast({
      title: "בדיקת חיבור בהמתנה",
      description: "החיבור עדיין נבדק ברקע",
      variant: "default",
    });
  }

  async function onGenerate() {
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לזהות את המשתמש",
        variant: "destructive",
      });
      return;
    }

    setLoading(true); 
    setError(null); 
    setStatus("idle"); 
    setCreds(null);
    
    try {
      const telegram_id = String(user.id);
      console.log('🚀 SFTP: Generating credentials for user:', telegram_id);
      console.log('🚀 SFTP: Using API base:', apiBase);
      console.log('🚀 SFTP: Using prefix:', prefix);
      
      const data = await post<Provision>("/sftp/provision", { telegram_id });
      console.log('✅ SFTP: Credentials generated successfully');
      
      setCreds(data.credentials); // includes one-time password
      
      toast({
        title: "SFTP חשבון נוצר בהצלחה",
        description: "פרטי הגישה שלך מוכנים לשימוש",
      });
      
      // auto test connection
      await pollTest(telegram_id);
      
    } catch (e: any) {
      const errorMessage = e?.message || "Provision failed";
      console.error('❌ SFTP: Generation error:', errorMessage);
      
      setError(errorMessage);
      setStatus("failed");
      setLocked(true);
      
      toast({
        title: "שגיאה ביצירת חשבון SFTP",
        description: `לא ניתן ליצור חשבון: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק ללוח",
      description: `${label} הועתק בהצלחה`,
    });
  };

  const resetGeneration = () => {
    setLocked(false);
    setStatus("idle");
    setCreds(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          הגדרות SFTP
        </CardTitle>
        <CardDescription>
          נהל את פרטי הגישה ל-SFTP עבור העלאת קבצי יהלומים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Button
            onClick={onGenerate}
            disabled={loading || locked}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                יוצר חשבון...
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

          {locked && (
            <Button
              onClick={resetGeneration}
              variant="outline"
              className="w-full"
            >
              צור חשבון חדש
            </Button>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">שגיאה: {error}</p>
            </div>
          )}

          {creds && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">פרטי חשבון SFTP</h3>
                <div className="flex items-center gap-2">
                  {status === "success" && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      מחובר
                    </Badge>
                  )}
                  {status === "failed" && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      לא מחובר
                    </Badge>
                  )}
                  {status === "pending" && (
                    <Badge variant="secondary">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      בודק חיבור...
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>שרת SFTP</Label>
                  <div className="flex gap-2">
                    <Input
                      value={creds.host}
                      readOnly
                      className="bg-muted"
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

                <div className="space-y-2">
                  <Label>שם משתמש</Label>
                  <div className="flex gap-2">
                    <Input
                      value={creds.username}
                      readOnly
                      className="bg-muted"
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

                {creds.password ? (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      סיסמה (שמור בבטחה!)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={creds.password}
                        type="text"
                        readOnly
                        className="bg-amber-50 border-amber-200 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(creds.password!, 'הסיסמה')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-amber-600">
                      ⚠️ זוהי הפעם האחרונה שתוכל לראות את הסיסמה. שמור אותה במקום בטוח!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>סיסמה</Label>
                    <div className="text-muted-foreground text-sm p-3 bg-muted/50 rounded-lg">
                      הסיסמה הוסתרה (מוצגת פעם אחת בלבד)
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>תיקיית העלאה</Label>
                  <Input
                    value={creds.folder_path}
                    readOnly
                    className="bg-muted font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    📁 תיקייה ייחודית לטלגרם ID: {user?.id}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>פורט</Label>
                  <div className="flex gap-2">
                    <Input
                      value={creds.port.toString()}
                      readOnly
                      className="bg-muted"
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
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">הוראות שימוש:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• השתמש בלקוח SFTP כמו FileZilla או WinSCP</li>
                  <li>• העלה קבצי CSV לתיקיית inbox</li>
                  <li>• הקבצים יעובדו אוטומטית תוך מספר דקות</li>
                  <li>• תקבל הודעה כשהעיבוד יסתיים</li>
                </ul>
              </div>

              {locked && (
                <p className="text-xs text-muted-foreground">
                  לאבטחה, הסיסמה מוצגת פעם אחת בלבד. צור חשבון חדש כדי לקבל אישורים חדשים.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
