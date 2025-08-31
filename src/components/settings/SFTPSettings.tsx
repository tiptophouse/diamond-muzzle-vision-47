
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Server, Key, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  getSftpStatus, 
  testSftpConnection, 
  deactivateSftp,
  type SFTPStatusResponse 
} from '@/api/sftp';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.mazalbot.com";

interface SFTPProvisionResponse {
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
  connection_test_result?: {
    status: 'success' | 'failed';
    message?: string;
  };
}

export function SFTPSettings() {
  const { user, isTelegramEnvironment } = useTelegramAuth();
  const { toast } = useToast();
  
  const [sftpAccount, setSftpAccount] = useState<SFTPStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<SFTPProvisionResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'failed' | null>(null);
  const [fastApiToken, setFastApiToken] = useState<string | null>(null);

  // Get real Telegram init data
  const getTelegramInitData = (): string | null => {
    if (typeof window === 'undefined') {
      console.log('🔍 Window not available');
      return null;
    }
    
    try {
      if (window.Telegram?.WebApp?.initData) {
        const initData = window.Telegram.WebApp.initData;
        console.log('🔍 Found real Telegram initData:', initData.length, 'characters');
        return initData;
      }
      
      console.warn('⚠️ No Telegram WebApp initData available');
      return null;
    } catch (error) {
      console.error('❌ Error getting Telegram initData:', error);
      return null;
    }
  };

  // Sign in to FastAPI backend using Telegram InitData
  const signInToBackend = async (): Promise<string | null> => {
    try {
      const initData = getTelegramInitData();
      if (!initData) {
        console.error('❌ No Telegram initData available for authentication');
        toast({
          title: "שגיאת אימות",
          description: "לא ניתן לאמת את הזהות דרך Telegram",
          variant: "destructive",
        });
        return null;
      }

      console.log('🔐 Signing in to FastAPI with Telegram initData...');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          init_data: initData
        }),
      });

      console.log('🔐 FastAPI sign-in response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ FastAPI sign-in failed:', response.status, errorText);
        toast({
          title: "שגיאת אימות",
          description: `לא ניתן להתחבר לשרת: ${response.status}`,
          variant: "destructive",
        });
        return null;
      }

      const result = await response.json();
      console.log('✅ FastAPI sign-in successful');
      
      if (!result.token) {
        console.error('❌ No token received from FastAPI');
        return null;
      }
      
      return result.token;
    } catch (error: any) {
      console.error('❌ FastAPI sign-in error:', error);
      toast({
        title: "שגיאת חיבור",
        description: "לא ניתן להתחבר לשרת כרגע",
        variant: "destructive",
      });
      return null;
    }
  };

  // Provision SFTP using FastAPI with authentication token
  // This now generates new credentials each time and invalidates old ones
  const provisionSFTPWithAuth = async (token: string): Promise<SFTPProvisionResponse | null> => {
    try {
      if (!user?.id) {
        console.error('❌ No user ID available for SFTP provision');
        return null;
      }

      console.log('🚀 Provisioning SFTP with FastAPI for user:', user.id);
      console.log('🔄 New password will be generated, old one will be invalidated');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/sftp/provision`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        body: JSON.stringify({
          telegram_id: user.id
        }),
      });

      console.log('📡 SFTP provision response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SFTP provision failed:', response.status, errorText);
        toast({
          title: "שגיאה ביצירת חשבון SFTP",
          description: `לא ניתן ליצור חשבון: ${response.status}`,
          variant: "destructive",
        });
        return null;
      }

      const result = await response.json();
      console.log('✅ SFTP provision successful:', result);
      
      // Validate expected username format: ftp_<telegram_id>
      const expectedUsername = `ftp_${user.id}`;
      if (result.username !== expectedUsername) {
        console.warn('⚠️ Username format mismatch. Expected:', expectedUsername, 'Got:', result.username);
      }
      
      // Validate expected folder path: /sftp/<telegram_id>/upload
      const expectedFolderPath = `/sftp/${user.id}/upload`;
      if (result.folder_path !== expectedFolderPath) {
        console.warn('⚠️ Folder path mismatch. Expected:', expectedFolderPath, 'Got:', result.folder_path);
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ SFTP provision error:', error);
      toast({
        title: "שגיאת חיבור",
        description: "לא ניתן ליצור חשבון SFTP כרגע",
        variant: "destructive",
      });
      return null;
    }
  };

  // Load existing SFTP account status
  useEffect(() => {
    const loadSFTPAccount = async () => {
      if (!user?.id) {
        console.log('❌ SFTP: No user ID available for loading account');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('🔍 SFTP: Loading account status for user ID:', user.id);
        
        const data = await getSftpStatus(user.id);
        console.log('✅ SFTP: Found existing account status:', data);
        setSftpAccount(data);
      } catch (error: any) {
        console.error('❌ SFTP: Error loading account:', error);
        
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
          console.log('ℹ️ SFTP: No existing account found (normal for first-time users)');
          setSftpAccount(null);
        } else {
          toast({
            title: "שגיאה בטעינת חשבון SFTP",
            description: `לא ניתן לטעון את פרטי החשבון: ${error.message}`,
            variant: "destructive",
          });
        }
        setSftpAccount(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSFTPAccount();
  }, [user?.id, toast]);

  const generateSFTPCredentials = async () => {
    console.log('🚀 SFTP: Generate button clicked - will create new password and invalidate old one');
    
    if (!user?.id) {
      console.error('❌ SFTP: No user ID available');
      toast({
        title: "שגיאה",
        description: "לא ניתן לזהות את המשתמש",
        variant: "destructive",
      });
      return;
    }

    if (!isTelegramEnvironment) {
      console.error('❌ SFTP: Not in Telegram environment');
      toast({
        title: "שגיאה",
        description: "יש להשתמש באפליקציה דרך Telegram",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    console.log('🔐 SFTP: Starting FastAPI authentication flow...');
    
    try {
      // Step 1: Sign in to FastAPI using Telegram initData
      const token = await signInToBackend();
      if (!token) {
        throw new Error('Failed to authenticate with FastAPI');
      }
      
      // Store token for other operations
      setFastApiToken(token);
      
      // Step 2: Provision SFTP with the authentication token
      // This will generate new credentials and invalidate old ones
      const data = await provisionSFTPWithAuth(token);
      if (!data) {
        throw new Error('Failed to provision SFTP account');
      }
      
      console.log('✅ SFTP: New credentials received from FastAPI');
      console.log('🔒 SFTP: Old password has been invalidated');
      
      // Update state with new credentials
      setCredentials(data);
      setShowPassword(true);
      
      // Also update the account info
      const accountInfo: SFTPStatusResponse = {
        id: data.id || `sftp_${user.id}`,
        ftp_username: data.ftp_username || data.username,
        ftp_folder_path: data.folder_path,
        status: data.status || 'active',
        created_at: data.created_at || new Date().toISOString(),
        last_used_at: data.last_used_at,
        expires_at: data.expires_at
      };
      
      setSftpAccount(accountInfo);

      // Check if automatic connection test was performed
      if (data.connection_test_result) {
        if (data.connection_test_result.status === 'success') {
          setConnectionStatus('success');
          toast({
            title: "✅ חשבון SFTP נוצר והחיבור נבדק בהצלחה",
            description: "פרטי הגישה שלך מוכנים לשימוש",
          });
        } else {
          setConnectionStatus('failed');
          toast({
            title: "⚠️ חשבון SFTP נוצר אך בדיקת החיבור נכשלה",
            description: data.connection_test_result.message || "נסה לבדוק את החיבור באופן ידני",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "✅ חשבון SFTP נוצר בהצלחה",
          description: "פרטי הגישה שלך מוכנים לשימוש",
        });

        // Manual connection test if automatic test wasn't performed
        setTimeout(() => {
          testConnection();
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('❌ SFTP: Generation failed:', error);
      
      toast({
        title: "❌ שגיאה ביצירת חשבון SFTP",
        description: error.message || "לא ניתן ליצור חשבון SFTP כרגע",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testConnection = async () => {
    if (!user?.id) {
      console.error('❌ SFTP: No user ID for connection test');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('checking');

    try {
      // Use stored FastAPI token if available, otherwise get new one
      let token = fastApiToken;
      if (!token) {
        console.log('🔐 SFTP: Getting new token for connection test');
        token = await signInToBackend();
        if (!token) {
          throw new Error('Failed to authenticate for connection test');
        }
        setFastApiToken(token);
      }

      console.log('🧪 SFTP: Testing connection with FastAPI token');
      
      // Use direct fetch with same authentication as provision
      const response = await fetch(`${API_BASE_URL}/api/v1/sftp/test-connection`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        body: JSON.stringify({
          telegram_id: user.id
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SFTP: Connection test failed:', response.status, errorText);
        throw new Error(`Connection test failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setConnectionStatus('success');
        toast({
          title: "✅ חיבור SFTP מוצלח",
          description: "החשבון שלך פעיל ומוכן לשימוש",
        });
      } else {
        setConnectionStatus('failed');
        toast({
          title: "❌ בדיקת חיבור נכשלה",
          description: data.message || "לא ניתן להתחבר לשרת SFTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ SFTP: Connection test error:', error);
      setConnectionStatus('failed');
      toast({
        title: "שגיאה בבדיקת חיבור",
        description: error.message || "לא ניתן לבדוק את החיבור כרגע",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק ללוח",
      description: `${label} הועתק בהצלחה`,
    });
  };

  const deactivateAccount = async () => {
    if (!user?.id) return;

    try {
      // Use stored FastAPI token if available, otherwise get new one
      let token = fastApiToken;
      if (!token) {
        token = await signInToBackend();
        if (!token) {
          throw new Error('Failed to authenticate for deactivation');
        }
      }

      // Use direct fetch with FastAPI authentication
      const response = await fetch(`${API_BASE_URL}/api/v1/sftp/deactivate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        body: JSON.stringify({
          telegram_id: user.id
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deactivation failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      setSftpAccount(null);
      setCredentials(null);
      setShowPassword(false);
      setConnectionStatus(null);
      setFastApiToken(null);

      toast({
        title: "✅ חשבון SFTP הושבת",
        description: result.message || "החשבון הושבת בהצלחה",
      });
    } catch (error: any) {
      console.error('❌ SFTP: Deactivation error:', error);
      toast({
        title: "❌ שגיאה",
        description: `לא ניתן להשבית את החשבון: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            הגדרות SFTP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          הגדרות SFTP
        </CardTitle>
        <CardDescription>
          נהל את פרטי הגישה ל-SFTP עבור העלאת קבצי יהלומים. כל לחיצה על "צור חשבון" תייצר סיסמה חדשה ותבטל את הקודמת.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!sftpAccount ? (
          <div className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">אין חשבון SFTP פעיל</h3>
              <p className="text-muted-foreground mb-4">
                צור חשבון SFTP כדי להעלות קבצי יהלומים באופן אוטומטי
              </p>
              {!isTelegramEnvironment && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 inline mr-2" />
                  <span className="text-amber-800">
                    יש להשתמש באפליקציה דרך Telegram למטרות אבטחה
                  </span>
                </div>
              )}
              <Button 
                onClick={generateSFTPCredentials}
                disabled={isGenerating || !isTelegramEnvironment}
                className="bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    יוצר חשבון...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    צור חשבון SFTP
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">פרטי חשבון SFTP</h3>
              <div className="flex items-center gap-2">
                <Badge variant={sftpAccount.status === 'active' ? 'default' : 'secondary'}>
                  {sftpAccount.status === 'active' ? 'פעיל' : 'לא פעיל'}
                </Badge>
                {connectionStatus === 'success' && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    מחובר
                  </Badge>
                )}
                {connectionStatus === 'failed' && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    לא מחובר
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>שרת SFTP</Label>
                <div className="flex gap-2">
                  <Input
                    value={credentials?.host || "טוען..."}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(credentials?.host || "", 'כתובת השרת')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>שם משתמש (ftp_{user?.id})</Label>
                <div className="flex gap-2">
                  <Input
                    value={credentials?.username || sftpAccount.ftp_username || "טוען..."}
                    readOnly
                    className="bg-muted font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(credentials?.username || sftpAccount.ftp_username || "", 'שם המשתמש')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showPassword && credentials?.password && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    סיסמה חדשה (הישנה בוטלה!)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={credentials.password}
                      type="text"
                      readOnly
                      className="bg-amber-50 border-amber-200 font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.password, 'הסיסמה')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-amber-600">
                    ⚠️ זוהי הפעם האחרונה שתוכל לראות את הסיסמה. שמור אותה במקום בטוח!
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>תיקיית העלאה (/sftp/{user?.id}/upload)</Label>
                <Input
                  value={credentials?.folder_path || sftpAccount.ftp_folder_path || "טוען..."}
                  readOnly
                  className="bg-muted font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>פורט</Label>
                <div className="flex gap-2">
                  <Input
                    value={credentials?.port?.toString() || "22"}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(String(credentials?.port || "22"), 'הפורט')}
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
                <li>• העלה קבצי CSV לתיקיית upload</li>
                <li>• הקבצים יעובדו אוטומטית דרך /api/v1/diamonds/batch</li>
                <li>• תקבל הודעה עם פרטים על הצלחות ושגיאות</li>
                <li>• כל חשבון מבודד בתיקיה נפרדת עם הגבלות גישה</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    בודק חיבור...
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4 mr-2" />
                    בדוק חיבור
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={generateSFTPCredentials}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    מחדש סיסמה...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    חדש סיסמה
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={deactivateAccount}
              >
                השבת חשבון
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
