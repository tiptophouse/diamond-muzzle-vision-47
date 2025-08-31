
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { signInToBackend } from '@/lib/api/auth';
import { provisionSftp, testSftpConnection } from '@/api/sftp';
import { 
  Server, 
  Upload, 
  Key, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  RefreshCw,
  Lock,
  Folder,
  Database
} from 'lucide-react';

interface SFTPCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  folder_path: string;
  ftp_username: string;
  status: string;
  created_at: string;
  id?: string;
  last_used_at?: string;
  expires_at?: string;
}

export function SFTPSettings() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  
  const [credentials, setCredentials] = useState<SFTPCredentials | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [lastProvisionTime, setLastProvisionTime] = useState<Date | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{ status: 'success' | 'failed'; message?: string } | null>(null);

  const provisionSFTPAccount = async () => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "משתמש לא מחובר",
        variant: "destructive",
      });
      return;
    }

    setIsProvisioning(true);
    setError(null);
    setConnectionTestResult(null);

    try {
      console.log('🚀 Starting SFTP provisioning for user:', user.id);
      
      // Step 1: Sign in to FastAPI backend using unified auth
      const initData = window.Telegram?.WebApp?.initData;
      if (!initData) {
        throw new Error('Telegram WebApp data not available');
      }

      console.log('🔐 Signing in to FastAPI backend...');
      const token = await signInToBackend(initData);
      
      if (!token) {
        throw new Error('Failed to authenticate with FastAPI backend');
      }

      console.log('✅ Authentication successful, provisioning SFTP...');
      
      // Step 2: Provision SFTP account using unified API
      const sftpData = await provisionSftp(user.id);
      console.log('✅ SFTP provisioning successful:', sftpData);

      // Update state with new credentials
      setCredentials(sftpData);
      setShowCredentials(true);
      setLastProvisionTime(new Date());

      toast({
        title: "🎉 חשבון SFTP הוקם בהצלחה!",
        description: `שם משתמש: ${sftpData.ftp_username} | תיקיית העלאה: ${sftpData.folder_path}`,
      });

      // Step 3: Auto-test connection
      console.log('🧪 Auto-testing SFTP connection...');
      setIsTestingConnection(true);
      
      try {
        const testResult = await testSftpConnection(user.id);
        setConnectionTestResult(testResult);
        
        if (testResult.status === 'success') {
          toast({
            title: "✅ בדיקת חיבור הצליחה",
            description: testResult.message || "החיבור לשרת SFTP עובד בהצלחה",
          });
        } else {
          toast({
            title: "⚠️ בדיקת חיבור נכשלה",
            description: testResult.message || "לא ניתן להתחבר לשרת SFTP",
            variant: "destructive",
          });
        }
      } catch (testError: any) {
        console.error('❌ Connection test error:', testError);
        setConnectionTestResult({ status: 'failed', message: testError.message });
        toast({
          title: "⚠️ שגיאה בבדיקת החיבור",
          description: testError.message,
          variant: "destructive",
        });
      } finally {
        setIsTestingConnection(false);
      }

    } catch (error: any) {
      console.error('❌ SFTP provisioning error:', error);
      setError(error.message);
      toast({
        title: "שגיאה ביצירת חשבון SFTP",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProvisioning(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "הועתק ללוח",
        description: "הטקסט הועתק בהצלחה",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>יש להתחבר כדי לגשת להגדרות SFTP</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SFTP Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            חשבון SFTP אוטומטי
          </CardTitle>
          <CardDescription>
            העלאת קבצי CSV באמצעות SFTP מאובטח עם הפרדה מלאה לכל משתמש
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!credentials ? (
            <div className="space-y-4">
              {/* Security Features */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  תכונות אבטחה
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• שם משתמש: ftp_{user.id} (ייחודי לכל משתמש)</li>
                  <li>• תיקיית עבודה מבודדת: /sftp/{user.id}/upload</li>
                  <li>• סיסמה חדשה בכל הפעלה (לא נשמרת במסד הנתונים)</li>
                  <li>• בדיקת חיבור אוטומטית עם פרטי החשבון</li>
                  <li>• עיבוד אוטומטי של CSV לצינור יהלומים</li>
                </ul>
              </div>

              <Button 
                onClick={provisionSFTPAccount} 
                disabled={isProvisioning}
                className="w-full"
                size="lg"
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    מקים חשבון SFTP...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    הקם חשבון SFTP חדש
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Status */}
              {connectionTestResult && (
                <Alert className={connectionTestResult.status === 'success' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center gap-2">
                    {connectionTestResult.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={connectionTestResult.status === 'success' ? "text-green-800" : "text-red-800"}>
                      {connectionTestResult.message || (connectionTestResult.status === 'success' ? 'חיבור SFTP תקין' : 'חיבור SFTP נכשל')}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {isTestingConnection && (
                <Alert>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertDescription>בודק חיבור SFTP...</AlertDescription>
                </Alert>
              )}

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    שם משתמש
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input value={credentials.ftp_username} readOnly className="bg-muted" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.ftp_username)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    תיקיית העלאה
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input value={credentials.folder_path} readOnly className="bg-muted" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.folder_path)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {showCredentials && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שרת SFTP</Label>
                    <div className="flex items-center gap-2">
                      <Input value={`${credentials.host}:${credentials.port}`} readOnly className="bg-muted" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${credentials.host}:${credentials.port}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      סיסמה
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="password" 
                        value={credentials.password} 
                        readOnly 
                        className="bg-muted font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(credentials.password)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {lastProvisionTime && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  חשבון הוקם ב: {lastProvisionTime.toLocaleString('he-IL')}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={provisionSFTPAccount}
                  disabled={isProvisioning}
                >
                  {isProvisioning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      מחדש סיסמה...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      חדש סיסמה
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            הוראות שימוש
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <p>התחבר לשרת SFTP באמצעות הפרטים שלמעלה</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <p>העלה קבצי CSV לתיקייה המיועדת שלך בלבד</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <p>הקבצים יעובדו אוטומטית והיהלומים יתווספו למלאי שלך</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <p>קבל דיווח מפורט על הצלחות וכשלים בעיבוד</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
