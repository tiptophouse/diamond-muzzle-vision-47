
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Server, Key, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { provisionSftp, type SFTPCredentials } from '@/api/sftp';
import { supabase } from '@/integrations/supabase/client';

interface SFTPAccount {
  id: string;
  ftp_username: string;
  ftp_folder_path: string;
  status: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
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
        
        const response = await fetch(`/api/v1/sftp/status/${user.id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Found existing SFTP account:', data);
          setSftpAccount(data);
        } else if (response.status === 404) {
          console.log('ℹ️ No existing SFTP account found');
          setSftpAccount(null);
        } else {
          throw new Error(`HTTP ${response.status}`);
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

  const sendTelegramNotification = async (message: string) => {
    if (!user?.id) return;
    
    try {
      await supabase.functions.invoke('send-telegram-message', {
        body: {
          telegram_id: user.id,
          message,
          parse_mode: 'HTML'
        }
      });
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
    }
  };

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
      
      const sftpCredentials = await provisionSftp(user.id);
      
      console.log('✅ SFTP account created successfully:', sftpCredentials);
      
      // Create a mock account object for UI compatibility
      const mockAccount: SFTPAccount = {
        id: `sftp_${user.id}`,
        ftp_username: sftpCredentials.username,
        ftp_folder_path: sftpCredentials.folder_path,
        status: sftpCredentials.test_result ? 'active' : 'inactive',
        created_at: new Date().toISOString(),
      };
      
      // Update state with new account and credentials
      setSftpAccount(mockAccount);
      setCredentials(sftpCredentials);
      setShowPassword(true);
      setConnectionStatus(sftpCredentials.test_result ? 'success' : 'failed');

      const successMessage = `🎉 <b>חשבון SFTP נוצר בהצלחה!</b>

📊 <b>פרטי החשבון:</b>
🏠 <b>שרת:</b> <code>${sftpCredentials.host}</code>
👤 <b>משתמש:</b> <code>${sftpCredentials.username}</code>
📁 <b>תיקייה:</b> <code>${sftpCredentials.folder_path}</code>
🔌 <b>פורט:</b> <code>${sftpCredentials.port}</code>
📊 <b>סטטוס:</b> ${sftpCredentials.test_result ? '✅ פעיל' : '❌ לא פעיל'}

🔑 הסיסמה נשמרה באפליקציה - אנא שמור אותה במקום בטוח!`;

      await sendTelegramNotification(successMessage);

      toast({
        title: "SFTP חשבון נוצר בהצלחה",
        description: "פרטי הגישה שלך מוכנים לשימוש",
      });
      
    } catch (error) {
      console.error('❌ Error generating SFTP credentials:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      const failureMessage = `❌ <b>שגיאה ביצירת חשבון SFTP</b>

🚫 לא הצלחנו ליצור חשבון SFTP עבורך.
📝 <b>פרטי השגיאה:</b> ${errorMessage}

אנא נסה שוב או פנה לתמיכה.`;

      await sendTelegramNotification(failureMessage);
      
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
      
      const response = await fetch('/api/v1/sftp/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ telegram_id: user.id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('✅ SFTP connection test successful');
        setConnectionStatus('success');
        
        const successMessage = `✅ <b>בדיקת חיבור SFTP הושלמה בהצלחה!</b>

🎯 החשבון שלך פעיל ומוכן לשימוש
📁 ניתן להעלות קבצים לתיקיית: <code>${credentials?.folder_path || 'inbox'}</code>
🚀 הקבצים יעובדו אוטומטי תוך מספר דקות

💡 <b>טיפ:</b> השתמש ב-FileZilla או WinSCP להעלאת קבצים`;

        await sendTelegramNotification(successMessage);
        
        toast({
          title: "חיבור SFTP מוצלח",
          description: "החשבון שלך פעיל ומוכן לשימוש",
        });
      } else {
        console.log('❌ SFTP connection test failed:', data);
        setConnectionStatus('failed');
        
        const failureMessage = `❌ <b>בדיקת חיבור SFTP נכשלה</b>

🚫 לא הצלחנו להתחבר לחשבון ה-SFTP שלך
📝 <b>סיבה:</b> ${data.message || 'שגיאה לא ידועה'}

🔧 אנא בדוק את פרטי החיבור או נסה שוב מאוחר יותר.`;

        await sendTelegramNotification(failureMessage);
        
        toast({
          title: "בדיקת חיבור נכשלה",
          description: data.message || "לא ניתן להתחבר לשרת SFTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error testing SFTP connection:', error);
      setConnectionStatus('failed');
      
      const errorMessage = `🔧 <b>שגיאה בבדיקת חיבור SFTP</b>

⚠️ אירעה שגיאה טכנית בבדיקת החיבור
🔄 אנא נסה שוב מאוחר יותר

אם הבעיה נמשכת, פנה לתמיכה.`;

      await sendTelegramNotification(errorMessage);
      
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
      
      const response = await fetch('/api/v1/sftp/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ telegram_id: user.id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
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
              <h3 className="text-lg font-semibold mb-2">יצירת חשבון SFTP</h3>
              <p className="text-muted-foreground mb-4">
                לחץ על הכפתור כדי ליצור חשבון SFTP ולקבל את כל פרטי הגישה
              </p>
              <Button 
                onClick={generateSFTPCredentials}
                disabled={isGenerating}
                size="lg"
                className="bg-primary hover:bg-primary/90 min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    מייצר חשבון SFTP...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    יצור חשבון SFTP
                  </>
                )}
              </Button>
              {isGenerating && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-blue-800 font-medium">
                      מחכה לתגובה מהשרת...
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2 text-center">
                    יוצר את חשבון ה-SFTP שלך וקובל את כל הפרטים
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with Status */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Server className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">חשבון SFTP נוצר בהצלחה!</h3>
                    <p className="text-sm text-green-600">כל הפרטים מוכנים לשימוש</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sftpAccount.status === 'active' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                    {sftpAccount.status === 'active' ? '✅ פעיל' : '⚠️ לא פעיל'}
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
            </div>

            {/* SFTP Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                פרטי הגישה ל-SFTP
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Host */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    שרת SFTP
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={credentials?.host || "טוען..."}
                      readOnly
                      className="bg-gray-50 border-gray-200 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials?.host || "", 'כתובת השרת')}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    שם משתמש
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={credentials?.username || sftpAccount.ftp_username || "טוען..."}
                      readOnly
                      className="bg-gray-50 border-gray-200 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials?.username || sftpAccount.ftp_username || "", 'שם המשתמש')}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Port */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">פורט</Label>
                  <div className="flex gap-2">
                    <Input
                      value={credentials?.port?.toString() || "22"}
                      readOnly
                      className="bg-gray-50 border-gray-200 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(String(credentials?.port || "22"), 'הפורט')}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">סטטוס חיבור</Label>
                  <div className="flex items-center gap-2">
                    {connectionStatus === null && (
                      <Badge variant="secondary">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        טרם נבדק
                      </Badge>
                    )}
                    {connectionStatus === 'checking' && (
                      <Badge variant="secondary">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        בודק...
                      </Badge>
                    )}
                    {connectionStatus === 'success' && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        פעיל ומחובר
                      </Badge>
                    )}
                    {connectionStatus === 'failed' && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        חיבור נכשל
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Folder Path - Full Width */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium text-gray-700">תיקיית העלאה</Label>
                <div className="relative">
                  <Input
                    value={credentials?.folder_path || sftpAccount.ftp_folder_path || "טוען..."}
                    readOnly
                    className="bg-gray-50 border-gray-200 font-mono text-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials?.folder_path || sftpAccount.ftp_folder_path || "", 'תיקיית העלאה')}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  📁 תיקייה ייחודית לטלגרם ID: {user?.id}
                </p>
              </div>

              {/* Password - Special handling */}
              {showPassword && credentials?.password && (
                <div className="space-y-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <Label className="flex items-center gap-2 text-amber-800 font-medium">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    סיסמה - שמור בבטחה!
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={credentials.password}
                      type="text"
                      readOnly
                      className="bg-white border-amber-300 font-mono text-sm text-amber-900"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.password, 'הסיסמה')}
                      className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-amber-100 p-3 rounded border border-amber-300">
                    <p className="text-sm text-amber-800 font-medium">
                      ⚠️ זוהי הפעם האחרונה שתוכל לראות את הסיסמה!
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      העתק ושמור את הסיסמה במקום בטוח לפני שתעזוב את הדף
                    </p>
                  </div>
                </div>
              )}
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
