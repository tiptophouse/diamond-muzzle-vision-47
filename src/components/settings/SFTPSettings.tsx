import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { testSftpConnection } from '@/api/sftp';
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
  upload_path: string;
  connection_test?: {
    success: boolean;
    message: string;
    details?: any;
  };
}

export function SFTPSettings() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  
  const [host, setHost] = useState('');
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [uploadPath, setUploadPath] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uptime, setUptime] = useState<number | null>(null);
  const [sftpEnabled, setSftpEnabled] = useState(false);
  const [sftpDetails, setSftpDetails] = useState<{ host: string; port: number; username: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [credentials, setCredentials] = useState<SFTPCredentials | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [lastProvisionTime, setLastProvisionTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchUptime = async () => {
      try {
        const response = await fetch('/api/uptime');
        if (response.ok) {
          const data = await response.json();
          setUptime(data.uptime);
        } else {
          console.error('Failed to fetch uptime');
        }
      } catch (error) {
        console.error('Error fetching uptime:', error);
      }
    };

    fetchUptime();
  }, []);

  const signInToFastAPI = async (): Promise<string | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🔐 Signing in to FastAPI...');
      
      const initData = window.Telegram?.WebApp?.initData;
      if (!initData) {
        throw new Error('Telegram WebApp data not available');
      }

      const response = await fetch('https://api.diamondbot.store/api/v1/auth/telegram/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          init_data: initData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Authentication failed: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      const token = data.access_token;
      
      if (!token) {
        throw new Error('No access token received');
      }

      console.log('✅ FastAPI authentication successful');
      setJwtToken(token);
      return token;
    } catch (error) {
      console.error('❌ FastAPI sign-in error:', error);
      throw error;
    }
  };

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

    try {
      console.log('🚀 Starting SFTP provisioning...');
      
      // Step 1: Sign in to FastAPI
      const token = await signInToFastAPI();
      
      // Step 2: Provision SFTP account
      console.log('📡 Provisioning SFTP account...');
      const response = await fetch('https://api.diamondbot.store/api/v1/sftp/provision', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`SFTP provisioning failed: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ SFTP provisioning successful:', data);

      // Update state with new credentials
      setCredentials(data);
      setShowCredentials(true);
      setLastProvisionTime(new Date());

      toast({
        title: "🎉 חשבון SFTP הוקם בהצלחה!",
        description: `שם משתמש: ftp_${user.id} | תיקיית העלאה: /sftp/${user.id}/upload`,
      });

      // Auto-test connection if test results are included
      if (data.connection_test) {
        if (data.connection_test.success) {
          toast({
            title: "✅ בדיקת חיבור הצליחה",
            description: data.connection_test.message,
          });
        } else {
          toast({
            title: "⚠️ בדיקת חיבור נכשלה",
            description: data.connection_test.message,
            variant: "destructive",
          });
        }
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

  const testConnection = async () => {
    if (!credentials || !jwtToken) {
      toast({
        title: "שגיאה",
        description: "אין פרטי חיבור או אסימון",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);

    try {
      console.log('🧪 Testing SFTP connection...');
      
      const response = await fetch('https://api.diamondbot.store/api/v1/sftp/test-connection', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Connection test failed: ${errorData.detail || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Connection test result:', result);

      // Update credentials with test results
      setCredentials(prev => prev ? {
        ...prev,
        connection_test: result
      } : null);

      if (result.success) {
        toast({
          title: "✅ חיבור SFTP תקין",
          description: result.message || "החיבור לשרת SFTP עובד בהצלחה",
        });
      } else {
        toast({
          title: "❌ חיבור SFTP נכשל",
          description: result.message || "לא ניתן להתחבר לשרת SFTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Connection test error:', error);
      toast({
        title: "שגיאה בבדיקת החיבור",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const deactivateAccount = async () => {
    // Implementation for deactivation
    console.log('Deactivating SFTP account...');
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

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
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
              {credentials.connection_test && (
                <Alert className={credentials.connection_test.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center gap-2">
                    {credentials.connection_test.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={credentials.connection_test.success ? "text-green-800" : "text-red-800"}>
                      {credentials.connection_test.message}
                    </AlertDescription>
                  </div>
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
                    <Input value={credentials.username} readOnly className="bg-muted" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.username)}
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
                    <Input value={credentials.upload_path} readOnly className="bg-muted" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.upload_path)}
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
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      בודק חיבור...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      בדוק חיבור
                    </>
                  )}
                </Button>

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

                <Button
                  variant="destructive"
                  onClick={deactivateAccount}
                  disabled={isDeactivating}
                >
                  {isDeactivating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      מבטל...
                    </>
                  ) : (
                    'בטל חשבון'
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
