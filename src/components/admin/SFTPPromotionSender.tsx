import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Server, Send, Users, Clock, CheckCircle, AlertCircle, Mail } from 'lucide-react';

interface User {
  telegram_id: number;
  first_name: string;
  last_name?: string;
}

export function SFTPPromotionSender() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // SFTP promotional message in Hebrew
  const sftpMessage = `🚀 חדש! חיבור SFTP זמין עכשיו! 

שלום {name},

יש לנו חדשות מרגשות! 🎉

עכשיו אתם יכולים לחבר את המערכת שלכם ישירות למאגר היהלומים שלנו דרך SFTP - ללא צורך בהעלאות ידניות!

✅ סנכרון אוטומטי של המלאי
✅ עדכונים בזמן אמת
✅ חיסכון בזמן ומאמץ
✅ נגישות 24/7

להפעלת החיבור, פשוט כתבו:
/provide_sftp

או צרו קשר עם הצוות שלנו לסיוע מלא בהתקנה.

💎 Brilliant Bot - הפתרון החכם לסחר ביהלומים`;

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .neq('telegram_id', 2138564172) // Exclude admin
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      
      toast({
        title: "משתמשים נטענו",
        description: `נמצאו ${data?.length || 0} משתמשים לשליחת הודעת SFTP`,
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "שגיאה",
        description: "נכשל בטעינת המשתמשים",
        variant: "destructive",
      });
    }
  };

  const sendSFTPPromotion = async () => {
    if (users.length === 0) {
      toast({
        title: "שגיאה",
        description: "נא לטעון משתמשים לפני השליחה",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    setErrors([]);

    try {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        try {
          // Personalize the message
          const personalizedMessage = sftpMessage.replace('{name}', user.first_name || 'משתמש יקר');
          
          // Email body for contact button
          const emailBody = encodeURIComponent(`שלום צוות Acadia,

אני מעוניין להתחבר ל-SFTP שלכם לסנכרון המלאי.

פרטי:
שם: ${user.first_name} ${user.last_name || ''}
Telegram ID: ${user.telegram_id}

אנא פנו אליי לקבלת פרטי החיבור.

תודה,
${user.first_name}`);

          const { data, error } = await supabase.functions.invoke('send-individual-message', {
            body: {
              telegramId: user.telegram_id,
              message: personalizedMessage,
              buttons: [
                {
                  text: '🔗 הפעל SFTP',
                  url: 'https://t.me/diamondmazalbot?start=provide_sftp'
                },
                {
                  text: '📧 צור קשר עם Acadia',
                  url: `mailto:info@accadiasoftware.com?subject=בקשה לחיבור SFTP&body=${emailBody}`
                },
                {
                  text: '💎 דשבורד היהלומים',
                  url: 'https://t.me/diamondmazalbot?startapp=inventory'
                }
              ]
            }
          });

          if (error) {
            console.error(`Error sending to ${user.telegram_id}:`, error);
            setErrorCount(prev => prev + 1);
            setErrors(prev => [...prev, `${user.first_name}: ${error.message}`]);
          } else {
            setSuccessCount(prev => prev + 1);
            console.log(`✅ SFTP promo sent to ${user.first_name} (${user.telegram_id})`);
          }

        } catch (error: any) {
          console.error(`Error sending to ${user.telegram_id}:`, error);
          setErrorCount(prev => prev + 1);
          setErrors(prev => [...prev, `${user.first_name}: ${error.message}`]);
        }

        // Update progress
        setProgress(((i + 1) / users.length) * 100);

        // Delay between messages to avoid rate limiting (2 seconds)
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: "שליחת SFTP הושלמה! 🎉",
        description: `נשלח ל-${successCount} משתמשים, ${errorCount} נכשלו`,
      });

    } catch (error: any) {
      console.error('Error in SFTP promotion sending:', error);
      toast({
        title: "שגיאה בשליחה",
        description: error.message || "נכשל בשליחת הודעות SFTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            שליחת הודעות SFTP לכל הלקוחות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Message Preview */}
          <div className="bg-muted p-4 rounded-lg" dir="rtl">
            <h4 className="font-semibold mb-2">תצוגה מקדימה של ההודעה:</h4>
            <div className="whitespace-pre-wrap text-sm font-mono bg-background p-3 rounded border">
              {sftpMessage.replace('{name}', 'שם המשתמש')}
            </div>
          </div>

          {/* Buttons Preview */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">כפתורים שיישלחו:</h4>
            <div className="space-y-2">
              <Badge variant="outline" className="flex items-center gap-2 w-fit">
                <Server className="h-3 w-3" />
                🔗 הפעל SFTP
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 w-fit">
                <Mail className="h-3 w-3" />
                📧 צור קשר עם Acadia
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 w-fit">
                💎 דשבורד היהלומים
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              כפתור המייל יפתח אוטומטיט עם הפרטים של המשתמש
            </p>
          </div>

          {/* User Management */}
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mr-2">
                <Users className="h-3 w-3 mr-1" />
                {users.length} משתמשים
              </Badge>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              טען משתמשים
            </Button>
          </div>

          {/* Progress Section */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">התקדמות שליחה</span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {successCount} הצליח
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    {errorCount} נכשל
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={sendSFTPPromotion} 
            disabled={isLoading || users.length === 0}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                שולח הודעות SFTP ל-{users.length} משתמשים...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                שלח הודעות SFTP ל-{users.length} משתמשים
              </>
            )}
          </Button>

          {/* Errors Display */}
          {errors.length > 0 && (
            <div className="bg-destructive/10 p-4 rounded-lg">
              <h4 className="font-semibold text-destructive mb-2">שגיאות ({errors.length}):</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {errors.slice(0, 10).map((error, index) => (
                  <p key={index} className="text-sm text-destructive">{error}</p>
                ))}
                {errors.length > 10 && (
                  <p className="text-sm text-muted-foreground">...ועוד {errors.length - 10} שגיאות</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}