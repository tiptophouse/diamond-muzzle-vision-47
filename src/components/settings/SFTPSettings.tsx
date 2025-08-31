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
  provisionSftp, 
  getSftpStatus, 
  testSftpConnection, 
  deactivateSftp,
  type SFTPProvisionResponse,
  type SFTPStatusResponse 
} from '@/api/sftp';

export function SFTPSettings() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  
  const [sftpAccount, setSftpAccount] = useState<SFTPStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<SFTPProvisionResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'failed' | null>(null);

  // Load existing SFTP account
  useEffect(() => {
    const loadSFTPAccount = async () => {
      if (!user?.id) {
        console.log('❌ SFTP: No user ID available for loading account');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('🔍 SFTP: Loading account for user ID:', user.id);
        
        const data = await getSftpStatus(user.id);
        console.log('✅ SFTP: Found existing account:', data);
        setSftpAccount(data);
      } catch (error: any) {
        console.error('❌ SFTP: Error loading account:', error);
        
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
          console.log('ℹ️ SFTP: No existing account found (this is normal for first-time users)');
          setSftpAccount(null);
        } else if (error.message?.includes('403') || error.message?.includes('Not authenticated')) {
          console.error('❌ SFTP: Authentication failed - user may not be properly logged in');
          toast({
            title: "אין אישור גישה",
            description: "נא לפתוח את האפליקציה דרך Telegram WebApp כדי לגשת לפונקצית SFTP",
            variant: "destructive",
          });
        } else {
          console.error('❌ SFTP: Unexpected error:', error.message);
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
    if (!user?.id) {
      console.error('❌ SFTP: No user ID available for provisioning');
      toast({
        title: "שגיאה",
        description: "לא ניתן לזהות את המשתמש. נא לוודא שאתה מחובר דרך Telegram",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    console.log('🚀 SFTP: Starting provision request for user ID:', user.id);
    
    try {
      console.log('📤 SFTP: Calling provisionSftp API...');
      
      const data = await provisionSftp(user.id);
      console.log('✅ SFTP: Provision successful! Response:', data);
      
      // Update state with new credentials
      setCredentials(data);
      
      // Also update the account info from the response
      setSftpAccount({
        id: data.id || `sftp_${user.id}`,
        ftp_username: data.ftp_username || data.username,
        ftp_folder_path: data.folder_path,
        status: data.status || 'active',
        created_at: data.created_at || new Date().toISOString(),
        last_used_at: data.last_used_at,
        expires_at: data.expires_at
      });
      
      setShowPassword(true);
      console.log('✅ SFTP: Credentials displayed successfully');

      toast({
        title: "SFTP חשבון נוצר בהצלחה",
        description: "פרטי הגישה שלך מוכנים לשימוש",
      });

      // Start connection testing after showing credentials
      setTimeout(() => {
        testConnection();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ SFTP: Provision failed:', error);
      
      if (error.message?.includes('403') || error.message?.includes('Not authenticated')) {
        console.error('❌ SFTP: Authentication error during provision');
        toast({
          title: "שגיאת אישור",
          description: "נא לוודא שאתה מחובר דרך Telegram WebApp כדי ליצור חשבון SFTP",
          variant: "destructive",
        });
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        console.error('❌ SFTP: Network error during provision');
        toast({
          title: "שגיאת רשת",
          description: "לא ניתן להתחבר לשרת. נא לבדוק את החיבור לאינטרנט ולנסות שוב",
          variant: "destructive",
        });
      } else {
        console.error('❌ SFTP: Unexpected provision error');
        toast({
          title: "שגיאה ביצירת חשבון SFTP",
          description: `לא ניתן ליצור חשבון: ${error.message}`,
          variant: "destructive",
        });
      }
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
    console.log('🔄 SFTP: Testing connection for user:', user.id);

    try {
      const data = await testSftpConnection(user.id);
      console.log('📡 SFTP: Connection test result:', data);
      
      if (data.status === 'success') {
        console.log('✅ SFTP: Connection test successful');
        setConnectionStatus('success');
        toast({
          title: "חיבור SFTP מוצלח",
          description: "החשבון שלך פעיל ומוכן לשימוש",
        });
      } else {
        console.log('❌ SFTP: Connection test failed:', data);
        setConnectionStatus('failed');
        toast({
          title: "בדיקת חיבור נכשלה",
          description: data.message || "לא ניתן להתחבר לשרת SFTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ SFTP: Connection test error:', error);
      setConnectionStatus('failed');
      toast({
        title: "שגיאה בבדיקת חיבור",
        description: "לא ניתן לבדוק את החיבור כרגע",
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
    if (!user?.id) {
      console.error('❌ SFTP: No user ID for deactivation');
      return;
    }

    try {
      console.log('🗑️ SFTP: Deactivating account for user:', user.id);
      
      const result = await deactivateSftp(user.id);
      console.log('✅ SFTP: Account deactivated successfully:', result);
      
      setSftpAccount(null);
      setCredentials(null);
      setShowPassword(false);
      setConnectionStatus(null);

      toast({
        title: "חשבון SFTP הושבת",
        description: result.message || "החשבון הושבת בהצלחה",
      });
    } catch (error: any) {
      console.error('❌ SFTP: Deactivation error:', error);
      toast({
        title: "שגיאה",
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
          נהל את פרטי הגישה ל-SFTP עבור העלאת קבצי יהלומים
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
              <Button 
                onClick={generateSFTPCredentials}
                disabled={isGenerating}
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
                <Label>שם משתמש</Label>
                <div className="flex gap-2">
                  <Input
                    value={credentials?.username || sftpAccount.ftp_username || "טוען..."}
                    readOnly
                    className="bg-muted"
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
                    סיסמה (שמור בבטחה!)
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
                <Label>תיקיית העלאה</Label>
                <Input
                  value={credentials?.folder_path || sftpAccount.ftp_folder_path || "טוען..."}
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
                <li>• העלה קבצי CSV לתיקיית inbox</li>
                <li>• הקבצים יעובדו אוטומטית תוך מספר דקות</li>
                <li>• תקבל הודעה כשהעיבוד יסתיים</li>
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
