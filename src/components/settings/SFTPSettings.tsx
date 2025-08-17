
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Server, Key, Copy, RefreshCw, AlertCircle } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');

  // Load existing SFTP account
  useEffect(() => {
    const loadSFTPAccount = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('ftp_accounts')
          .select('*')
          .eq('telegram_id', user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading SFTP account:', error);
          return;
        }

        if (data) {
          setSftpAccount(data);
        }
      } catch (error) {
        console.error('Error loading SFTP account:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSFTPAccount();
  }, [user]);

  const generateSFTPCredentials = async () => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      // Generate random password
      const password = generateRandomPassword();
      const username = `user_${user.id}_${Date.now()}`;
      const folderPath = `/diamonds/${user.id}`;

      const { data, error } = await supabase
        .from('ftp_accounts')
        .insert({
          telegram_id: user.id,
          user_id: user.id,
          ftp_username: username,
          password_hash: password, // In real implementation, this should be hashed
          ftp_folder_path: folderPath,
          status: 'active',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSftpAccount(data);
      setGeneratedPassword(password);
      setShowPassword(true);

      toast({
        title: "SFTP חשבון נוצר בהצלחה",
        description: "פרטי הגישה שלך מוכנים לשימוש",
      });
    } catch (error) {
      console.error('Error generating SFTP credentials:', error);
      toast({
        title: "שגיאה ביצירת חשבון SFTP",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק ללוח",
      description: `${label} הועתק בהצלחה`,
    });
  };

  const deactivateAccount = async () => {
    if (!sftpAccount) return;

    try {
      const { error } = await supabase
        .from('ftp_accounts')
        .update({ status: 'inactive' })
        .eq('id', sftpAccount.id);

      if (error) throw error;

      setSftpAccount(null);
      setGeneratedPassword('');
      setShowPassword(false);

      toast({
        title: "חשבון SFTP הושבת",
        description: "החשבון הושבת בהצלחה",
      });
    } catch (error) {
      console.error('Error deactivating SFTP account:', error);
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
              <Badge variant={sftpAccount.status === 'active' ? 'default' : 'secondary'}>
                {sftpAccount.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>שרת SFTP</Label>
                <div className="flex gap-2">
                  <Input
                    value="sftp.mazalbot.com"
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('sftp.mazalbot.com', 'כתובת השרת')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>שם משתמש</Label>
                <div className="flex gap-2">
                  <Input
                    value={sftpAccount.ftp_username}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(sftpAccount.ftp_username, 'שם המשתמש')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showPassword && generatedPassword && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    סיסמה (שמור בבטחה!)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedPassword}
                      type="text"
                      readOnly
                      className="bg-amber-50 border-amber-200 font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedPassword, 'הסיסמה')}
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
                  value={sftpAccount.ftp_folder_path}
                  readOnly
                  className="bg-muted font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>פורט</Label>
                <div className="flex gap-2">
                  <Input
                    value="22"
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('22', 'הפורט')}
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
                <li>• העלה קבצי CSV לתיקייה שצוינה למעלה</li>
                <li>• הקבצים יעובדו אוטומטית תוך מספר דקות</li>
                <li>• תקבל הודעה כשהעיבוד יסתיים</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
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
