
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Server, Key, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface SFTPAccount {
  id: string;
  ftp_username: string;
  ftp_folder_path: string;
  status: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
}

interface SFTPCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  folder_path: string;
}

interface FastAPIResponse {
  credentials: SFTPCredentials;
  account: SFTPAccount;
}

export function SFTPSettings() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  
  const [sftpAccount, setSftpAccount] = useState<SFTPAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<SFTPCredentials | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'failed' | null>(null);

  // Load existing SFTP account
  useEffect(() => {
    const loadSFTPAccount = async () => {
      if (!user?.id) return;
      
      try {
        console.log('🔍 Loading SFTP account for user:', user.id);
        
        // Use Supabase function with proper JWT
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('sftp-status', {
          body: { userId: user.id }
        });

        if (!error && data) {
          console.log('✅ Found existing SFTP account:', data);
          setSftpAccount(data);
        } else if (error?.message?.includes('404')) {
          console.log('ℹ️ No existing SFTP account found');
          setSftpAccount(null);
        } else if (error) {
          throw new Error(error.message);
        }
      } catch (error) {
        console.error('❌ Error loading SFTP account:', error);
        setSftpAccount(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSFTPAccount();
  }, [user]);

  const generateSFTPCredentials = async () => {
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לזהות את המשתמש",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      console.log('📤 Requesting SFTP provision for user:', user.id);
      
      // Use Supabase function with proper JWT
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('sftp-provision', {
        body: { telegram_id: user.id }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create SFTP account');
      }
      console.log('✅ SFTP account created successfully:', data);
      
      // Update state with new account and credentials
      setSftpAccount(data.account);
      setCredentials(data.credentials);
      setShowPassword(true);

      toast({
        title: "SFTP חשבון נוצר בהצלחה",
        description: "פרטי הגישה שלך מוכנים לשימוש",
      });

      // Start connection testing after showing credentials
      setTimeout(() => {
        testConnection();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error generating SFTP credentials:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "שגיאה ביצירת חשבון SFTP",
        description: `לא ניתן ליצור חשבון: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testConnection = async () => {
    if (!user?.id) return;

    setIsTestingConnection(true);
    setConnectionStatus('checking');

    try {
      console.log('🔄 Testing SFTP connection for user:', user.id);
      
      // Use Supabase function with proper JWT
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('sftp-test-connection', {
        body: { telegram_id: user.id }
      });

      if (error) {
        throw new Error(error.message || 'Connection test failed');
      }
      
      if (data.status === 'success') {
        console.log('✅ SFTP connection test successful');
        setConnectionStatus('success');
        toast({
          title: "חיבור SFTP מוצלח",
          description: "החשבון שלך פעיל ומוכן לשימוש",
        });
      } else {
        console.log('❌ SFTP connection test failed:', data);
        setConnectionStatus('failed');
        toast({
          title: "בדיקת חיבור נכשלה",
          description: data.message || "לא ניתן להתחבר לשרת SFTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error testing SFTP connection:', error);
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
    if (!user?.id) return;

    try {
      console.log('🗑️ Deactivating SFTP account for user:', user.id);
      
      // Use Supabase function with proper JWT
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('sftp-deactivate', {
        body: { telegram_id: user.id }
      });

      if (error) {
        throw new Error(error.message || 'Failed to deactivate SFTP account');
      }

      console.log('✅ SFTP account deactivated successfully');
      
      setSftpAccount(null);
      setCredentials(null);
      setShowPassword(false);
      setConnectionStatus(null);

      toast({
        title: "חשבון SFTP הושבת",
        description: "החשבון הושבת בהצלחה",
      });
    } catch (error) {
      console.error('❌ Error deactivating SFTP account:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להשבית את החשבון",
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
