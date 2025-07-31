
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, TestTube, Users, MessageSquare, Loader2, CheckCircle } from 'lucide-react';

export function BulkAnnouncementSender() {
  const { toast } = useToast();
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const announcementMessage = `שלום לכולם,

אני שמח לבשר כי הגענו ל-100 משתמשים פעילים בפלטפורמה!
זהו ציון דרך משמעותי, וההישג הזה שייך בראש ובראשונה לכם – המשתמשים הראשונים, שהיו שותפים לדרך ולחזון.

בזכותכם, פתחנו גישה בלעדית לקבוצת הליבה:

🔹 הגבלת יהלומים מורחבת ל-3,000

🔹 גישה מוקדמת לפיצ'רים ולכלים חכמים, כולל רשימות משאלות והעדפות מותאמות

🔹 עדכונים שוטפים ושיפור מתמיד – בזכות הפידבק שלכם

תודה אישית לאביעד בשארי, יושב הראש, שמוביל את החזון.
תודה לישראל וונצובסקי, המשנה למנכ"ל, שמנווט את הדרך ודואג שכל פרט יתבצע.
ותודה למנש בטאט, שמלווה ודוחף את המיזם בהתמדה.

תודה רבה גם לוועדת החדשנות על התמיכה והאמון.

מהיום אני עם תג קבוע לבורסה, ואשמח לפגוש כל אחד ואחת מכם גם באופן אישי – להכיר, להקשיב, ולבנות יחד עתיד חכם וטוב יותר לענף.

אני מזמין אתכם לתאם פגישה אישית או דמו, כדי שנוכל להתקדם ביחד ולהפיק את המקסימום מהכלים החדשים.
פנו אליי בפרטי – ואשמח לסייע.

תודה על האמון והשותפות.
חד נמשיך להצעיד את המערכת קדימה.`;

  const sendTestMessage = async () => {
    setIsTestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-announcement', {
        body: {
          message: announcementMessage,
          telegramGroupUrl: 'https://t.me/+VhmlB_31N_NmMzJk',
          isTest: true,
          testTelegramId: 2138564172 // Admin ID
        }
      });

      if (error) throw error;

      setTestSent(true);
      toast({
        title: "הודעת מבחן נשלחה! 🧪",
        description: "בדוק את הטלגרם שלך לראות איך ההודעה נראית",
      });

    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: "שגיאה בשליחת מבחן",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const sendBulkMessage = async () => {
    if (!testSent) {
      toast({
        title: "שלח קודם הודעת מבחן",
        description: "חובה לבדוק את ההודעה לפני שליחה המונית",
        variant: "destructive",
      });
      return;
    }

    setIsBulkLoading(true);
    try {
      // Get all user telegram IDs
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name');

      if (usersError) throw usersError;

      const { data, error } = await supabase.functions.invoke('send-announcement', {
        body: {
          message: announcementMessage,
          telegramGroupUrl: 'https://t.me/+VhmlB_31N_NmMzJk',
          isTest: false,
          users: users
        }
      });

      if (error) throw error;

      toast({
        title: "ההודעה נשלחה בהצלחה! 🎉",
        description: `נשלחה ל-${users.length} משתמשים`,
      });

    } catch (error) {
      console.error('Error sending bulk message:', error);
      toast({
        title: "שגיאה בשליחה המונית",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            שליחת הודעת 100 משתמשים
          </CardTitle>
          <CardDescription>
            שלח הודעת חגיגה להגעה ל-100 משתמשים עם קישור לקבוצת הליבה
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Preview */}
          <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto" dir="rtl">
            <h4 className="font-semibold mb-2">תצוגה מקדימה של ההודעה:</h4>
            <div className="text-sm whitespace-pre-line">
              {announcementMessage}
            </div>
          </div>

          {/* Group Link Preview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h4 className="font-medium mb-1">כפתור קישור לקבוצה:</h4>
            <p className="text-sm text-muted-foreground">
              יתווסף כפתור "הצטרף לקבוצת הליבה 🎯" עם הקישור: https://t.me/+VhmlB_31N_NmMzJk
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={sendTestMessage}
              disabled={isTestLoading}
              variant="outline"
              className="w-full"
            >
              {isTestLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : testSent ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              {isTestLoading ? 'שולח מבחן...' : testSent ? 'מבחן נשלח ✓' : 'שלח מבחן לעצמי קודם'}
            </Button>

            <Button 
              onClick={sendBulkMessage}
              disabled={isBulkLoading || !testSent}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isBulkLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isBulkLoading ? 'שולח לכולם...' : 'שלח לכל המשתמשים (100+)'}
            </Button>
          </div>

          {!testSent && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ חובה לבדוק את ההודעה עם מבחן לפני שליחה המונית לכל המשתמשים
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
