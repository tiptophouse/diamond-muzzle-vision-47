
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Server, Key, Copy, RefreshCw, AlertCircle, CheckCircle, TestTube, Bug } from 'lucide-react';
import { provisionSftp, getSftpStatus, type SFTPCredentials } from '@/api/sftp';
import { supabase } from '@/integrations/supabase/client';
import { signInToBackend, getBackendAuthToken } from '@/lib/api/auth';
import { getBackendAccessToken } from '@/lib/api/secureConfig';
import { getTelegramWebApp } from '@/utils/telegramWebApp';

export function SFTPSettings() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);
  const [credentials, setCredentials] = useState<SFTPCredentials | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'failed' | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log('🔍 SFTP Debug:', logEntry);
    setDebugInfo(prev => [...prev.slice(-9), logEntry]); // Keep last 10 entries
  };

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
      addDebugLog(`Telegram notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const ensureAuthentication = async (): Promise<string | null> => {
    addDebugLog('🔐 Starting authentication check...');
    
    if (!user?.id) {
      addDebugLog('❌ No user ID available');
      throw new Error('User not authenticated');
    }

    addDebugLog(`👤 User ID: ${user.id}, Name: ${user.first_name}`);

    // Step 1: Check if we already have a backend token
    let backendToken = getBackendAuthToken();
    addDebugLog(`🎫 Existing backend token: ${backendToken ? 'Found' : 'Not found'}`);

    if (!backendToken) {
      // Step 2: Try to get Telegram initData for backend sign-in
      const tg = getTelegramWebApp();
      addDebugLog(`📱 Telegram WebApp: ${tg ? 'Available' : 'Not available'}`);
      
      if (tg?.initData) {
        addDebugLog(`📝 InitData length: ${tg.initData.length}`);
        try {
          backendToken = await signInToBackend(tg.initData);
          addDebugLog(`✅ Backend sign-in result: ${backendToken ? 'Success' : 'Failed'}`);
        } catch (error) {
          addDebugLog(`❌ Backend sign-in error: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
      } else {
        addDebugLog('⚠️ No Telegram initData available for backend sign-in');
      }
    }

    // Step 3: Fallback to secure config token if no backend token
    if (!backendToken) {
      try {
        backendToken = await getBackendAccessToken();
        addDebugLog(`🔑 Secure config token: ${backendToken ? 'Retrieved' : 'Failed'}`);
      } catch (error) {
        addDebugLog(`❌ Secure config token error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    if (!backendToken) {
      addDebugLog('❌ No authentication token available');
      throw new Error('Unable to obtain authentication token');
    }

    addDebugLog('✅ Authentication successful');
    return backendToken;
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
    setDebugInfo([]);
    addDebugLog('🚀 Starting SFTP provision process');
    
    try {
      // Step 1: Ensure authentication
      const authToken = await ensureAuthentication();
      
      // Step 2: Make the SFTP provision request
      addDebugLog('📤 Making SFTP provision request');
      addDebugLog(`🎯 Endpoint: https://api.mazalbot.com/api/v1/sftp/provision`);
      addDebugLog(`👤 User ID: ${user.id}`);
      
      const sftpCredentials = await provisionSftp(user.id);
      
      addDebugLog('✅ SFTP provision successful');
      addDebugLog(`📊 Response: ${JSON.stringify(sftpCredentials, null, 2)}`);
      
      // Update state with new credentials
      setCredentials(sftpCredentials);
      setConnectionStatus(sftpCredentials.test_result ? 'success' : 'failed');

      const successMessage = `🎉 <b>חשבון SFTP נוצר בהצלחה!</b>

📊 <b>פרטי החשבון:</b>
🏠 <b>שרת:</b> <code>${sftpCredentials.host}</code>
👤 <b>משתמש:</b> <code>${sftpCredentials.username}</code>
📁 <b>תיקייה:</b> <code>${sftpCredentials.folder_path}</code>
🔌 <b>פורט:</b> <code>${sftpCredentials.port}</code>
🔑 <b>סיסמה:</b> <code>${sftpCredentials.password}</code>
📊 <b>סטטוס:</b> ${sftpCredentials.test_result ? '✅ פעיל' : '❌ לא פעיל'}

⚠️ <b>חשוב:</b> זוהי הפעם היחידה שבה תראה את הסיסמה - שמור אותה במקום בטוח!
🔄 לחיצה חוזרת על הכפתור תיצור סיסמה חדשה ותבטל את הקודמת.`;

      await sendTelegramNotification(successMessage);

      toast({
        title: "SFTP חשבון נוצר בהצלחה",
        description: "פרטי הגישה נשלחו אליך בטלגרם",
      });
      
    } catch (error) {
      console.error('❌ Error generating SFTP credentials:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addDebugLog(`❌ SFTP provision failed: ${errorMessage}`);
      
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
    addDebugLog('🔄 Starting SFTP connection test');

    try {
      const authToken = await ensureAuthentication();
      
      addDebugLog('🧪 Testing SFTP connection');
      addDebugLog(`🎯 Test endpoint: https://api.mazalbot.com/api/v1/sftp/test-connection`);
      
      const response = await fetch('https://api.mazalbot.com/api/v1/sftp/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ telegram_id: user.id }),
      });

      addDebugLog(`📡 Test response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      addDebugLog(`📊 Test response: ${JSON.stringify(data, null, 2)}`);
      
      if (data.status === 'success') {
        addDebugLog('✅ SFTP connection test successful');
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
        addDebugLog(`❌ SFTP connection test failed: ${data.message || 'Unknown error'}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugLog(`❌ Connection test failed: ${errorMessage}`);
      setConnectionStatus('failed');
      
      const errorMsg = `🔧 <b>שגיאה בבדיקת חיבור SFTP</b>

⚠️ אירעה שגיאה טכנית בבדיקת החיבור
🔄 אנא נסה שוב מאוחר יותר

אם הבעיה נמשכת, פנה לתמיכה.`;

      await sendTelegramNotification(errorMsg);
      
      toast({
        title: "שגיאה בבדיקת חיבור",
        description: "לא ניתן לבדוק את החיבור כרגע",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const loadExistingCredentials = async () => {
    if (!user?.id) return;
    
    setIsLoadingCredentials(true);
    addDebugLog('🔍 Checking for existing SFTP credentials...');
    
    try {
      const existingCredentials = await getSftpStatus(user.id);
      if (existingCredentials) {
        addDebugLog('✅ Found existing SFTP credentials');
        setCredentials(existingCredentials);
        setConnectionStatus(existingCredentials.test_result ? 'success' : 'failed');
      } else {
        addDebugLog('ℹ️ No existing SFTP credentials found');
      }
    } catch (error) {
      console.error('❌ Error loading SFTP credentials:', error);
      addDebugLog(`❌ Failed to load credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadExistingCredentials();
    }
  }, [user?.id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק ללוח",
      description: `${label} הועתק בהצלחה`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          הגדרות SFTP
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="ml-auto"
          >
            <Bug className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          נהל את פרטי הגישה ל-SFTP עבור העלאת קבצי יהלומים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debug Panel */}
        {showDebug && debugInfo.length > 0 && (
          <div className="bg-gray-100 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Bug className="h-4 w-4" />
              מידע דיבוג
            </h4>
            <div className="text-xs font-mono max-h-40 overflow-y-auto space-y-1">
              {debugInfo.map((log, i) => (
                <div key={i} className="text-gray-700">{log}</div>
              ))}
            </div>
          </div>
        )}

        {isLoadingCredentials ? (
          <div className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
              <h3 className="text-lg font-semibold mb-2">טוען פרטי SFTP...</h3>
              <p className="text-muted-foreground">
                בודק אם יש לך כבר חשבון SFTP קיים
              </p>
            </div>
          </div>
        ) : !credentials ? (
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
                  <Badge variant={credentials.test_result ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                    {credentials.test_result ? '✅ פעיל' : '⚠️ לא פעיל'}
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
                      value={credentials.host}
                      readOnly
                      className="bg-gray-50 border-gray-200 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.host, 'כתובת השרת')}
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
                      value={credentials.username}
                      readOnly
                      className="bg-gray-50 border-gray-200 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.username, 'שם המשתמש')}
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
                      value={credentials.port.toString()}
                      readOnly
                      className="bg-gray-50 border-gray-200 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(String(credentials.port), 'הפורט')}
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
                    value={credentials.folder_path}
                    readOnly
                    className="bg-gray-50 border-gray-200 font-mono text-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.folder_path, 'תיקיית העלאה')}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  📁 תיקייה ייחודית לטלגרם ID: {user?.id}
                </p>
              </div>

              {/* Password - Always show when credentials exist */}
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
                    ⚠️ לחיצה חוזרת על "יצור חשבון SFTP" תיצור סיסמה חדשה ותבטל את הקודמת!
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    שמור את הסיסמה במקום בטוח - היא לא נשמרת בשרת
                  </p>
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
                    <TestTube className="h-4 w-4 mr-2" />
                    בדוק חיבור
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCredentials(null)}
              >
                צור חשבון חדש
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
