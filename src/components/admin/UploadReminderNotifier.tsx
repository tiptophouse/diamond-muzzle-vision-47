
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Send, Users, ExternalLink, RefreshCw } from 'lucide-react';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';

export function UploadReminderNotifier() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { userCounts, stats, loading: diamondCountsLoading, forceRefresh } = useUserDiamondCounts();

  // Get users with EXACTLY zero diamonds from our accurate FastAPI data
  const usersWithoutInventory = userCounts.filter(user => user.diamond_count === 0);

  console.log('📊 UploadReminderNotifier: Total users:', userCounts.length);
  console.log('📊 UploadReminderNotifier: Users with 0 diamonds:', usersWithoutInventory.length);
  console.log('📊 UploadReminderNotifier: Sample users with diamonds:', 
    userCounts.filter(u => u.diamond_count > 0).slice(0, 3).map(u => ({
      name: u.first_name,
      count: u.diamond_count
    }))
  );

  const sendAnnouncementToAll = async () => {
    try {
      setIsLoading(true);
      
      const message = `שלום לכולם,

אני שמח לבשר כי הגענו ל-100 משתמשים פעילים בפלטפורמה!
זהו ציון דרך משמעותי, וההישג הזה שייך בראש ובראשונה לכם – המשתמשים הראשונים, שהיו שותפים לדרך ולחזון.

בזכותכם, פתחנו גישה בלעדית לקבוצת הליבה:

• הגבלת יהלומים מורחבת ל-3,000
• גישה מוקדמת לפיצ'רים ולכלים חכמים, כולל רשימות משאלות והעדפות מותאמות
• עדכונים שוטפים ושיפור מתמיד – בזכות הפידבק שלכם

תודה אישית לאביעד בשארי, יושב הראש, שמוביל את החזון.
תודה לישראל וונצובסקי, המשנה למנכ"ל, שמנווט את הדרך ודואג שכל פרט יתבצע.
ותודה למנש בטאט, שמלווה ודוחף את המיזם בהתמדה.

תודה רבה גם לוועדת החדשנות על התמיכה והאמון.

מהיום אני עם תג קבוע לבורסה, ואשמח לפגוש כל אחד ואחת מכם גם באופן אישי – להכיר, להקשיב, ולבנות יחד עתיד חכם וטוב יותר לענף.

אני מזמין אתכם לתאם פגישה אישית או דמו, כדי שנוכל להתקדם ביחד ולהפיק את המקסימום מהכלים החדשים.
פנו אליי בפרטי – ואשמח לסייע.

תודה על האמון והשותפות.
חד נמשיך להציע את המערכת קדימה.`;

      // Call edge function to send announcement
      const { data, error } = await supabase.functions.invoke('send-announcement', {
        body: {
          message,
          groupUrl: 'https://t.me/+VhmlB_31N_NmMzJk',
          buttonText: 'הצטרף לקבוצת הליבה 💎',
          users: userCounts, // Send to all users
          testMode: false
        }
      });

      if (error) throw error;

      toast({
        title: "הודעה נשלחה!",
        description: `ההודעה נשלחה בהצלחה ל-${userCounts.length} משתמשים`,
      });

    } catch (error) {
      console.error('Error sending announcement:', error);
      toast({
        title: "שגיאה",
        description: "נכשל לשלוח את ההודעה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    try {
      setIsLoading(true);
      
      const message = `שלום לכולם,

אני שמח לבשר כי הגענו ל-100 משתמשים פעילים בפלטפורמה!
זהו ציון דרך משמעותי, וההישג הזה שייך בראש ובראשונה לכם – המשתמשים הראשונים, שהיו שותפים לדרך ולחזון.

בזכותכם, פתחנו גישה בלעדית לקבוצת הליבה:

• הגבלת יהלומים מורחבת ל-3,000
• גישה מוקדמת לפיצ'רים ולכלים חכמים, כולל רשימות משאלות והעדפות מותאמות
• עדכונים שוטפים ושיפור מתמיד – בזכות הפידבק שלכם

תודה אישית לאביעד בשארי, יושב הראש, שמוביל את החזון.
תודה לישראל וונצובסקי, המשנה למנכ"ל, שמנווט את הדרך ודואג שכל פרט יתבצע.
ותודה למנש בטאט, שמלווה ודוחף את המיזם בהתמדה.

תודה רבה גם לוועדת החדשנות על התמיכה והאמון.

מהיום אני עם תג קבוע לבורסה, ואשמח לפגוש כל אחד ואחת מכם גם באופן אישי – להכיר, להקשיב, ולבנות יחד עתיד חכם וטוב יותר לענף.

אני מזמין אתכם לתאם פגישה אישית או דמו, כדי שנוכל להתקדם ביחד ולהפיק את המקסימום מהכלים החדשים.
פנו אליי בפרטי – ואשמח לסייע.

תודה על האמון והשותפות.
חד נמשיך להציע את המערכת קדימה.`;

      // Send test message to admin only
      const { data, error } = await supabase.functions.invoke('send-announcement', {
        body: {
          message,
          groupUrl: 'https://t.me/+VhmlB_31N_NmMzJk',
          buttonText: 'הצטרף לקבוצת הליבה 💎',
          users: [], // Empty array will send only to admin
          testMode: true
        }
      });

      if (error) throw error;

      toast({
        title: "הודעת בדיקה נשלחה!",
        description: "ההודעה נשלחה אליך בטלגרם לבדיקה",
      });

    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: "שגיאה",
        description: "נכשל לשלוח הודעת בדיקה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (diamondCountsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading accurate diamond counts from FastAPI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          הודעת ציון דרך - 100 משתמשים
        </CardTitle>
        <CardDescription>
          שלח הודעה מיוחדת לכל המשתמשים בטלגרם עם קישור לקבוצת הליבה
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg" dir="rtl">
          <h4 className="font-medium mb-2">מה זה יעשה:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• שלח הודעה מיוחדת לכל המשתמשים בטלגרם</li>
            <li>• הוסף כפתור מובנה לקבוצת הליבה</li>
            <li>• בדוק תחילה עם הודעת מבחן למנהל</li>
            <li>• הודעה מותאמת אישית בעברית</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-medium">סטטיסטיקות משתמשים</span>
            <Button
              onClick={forceRefresh}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">סה"כ משתמשים:</span>
              <span className="ml-2 font-medium">{stats.totalUsers}</span>
            </div>
            <div>
              <span className="text-muted-foreground">עם יהלומים:</span>
              <span className="ml-2 font-medium text-green-600">{stats.usersWithDiamonds}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ללא יהלומים:</span>
              <span className="ml-2 font-medium text-orange-600">{stats.usersWithZeroDiamonds}</span>
            </div>
            <div>
              <span className="text-muted-foreground">סה"כ יהלומים:</span>
              <span className="ml-2 font-medium text-purple-600">{stats.totalDiamonds}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
          <h4 className="font-medium mb-3 text-purple-800 dark:text-purple-200 text-lg">
            🎉 הודעת ציון דרך - 100 משתמשים!
          </h4>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg mb-4 max-h-64 overflow-y-auto" dir="rtl">
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
שלום לכולם,

אני שמח לבשר כי הגענו ל-100 משתמשים פעילים בפלטפורמה!
זהו ציון דרך משמעותי, וההישג הזה שייך בראש ובראשונה לכם – המשתמשים הראשונים, שהיו שותפים לדרך ולחזון.

בזכותכם, פתחנו גישה בלעדית לקבוצת הליבה:

• הגבלת יהלומים מורחבת ל-3,000
• גישה מוקדמת לפיצ'רים ולכלים חכמים, כולל רשימות משאלות והעדפות מותאמות
• עדכונים שוטפים ושיפור מתמיד – בזכות הפידבק שלכם

תודה אישית לאביעד בשארי, יושב הראש, שמוביל את החזון.
תודה לישראל וונצובסקי, המשנה למנכ"ל, שמנווט את הדרך ודואג שכל פרט יתבצע.
ותודה למנש בטאט, שמלווה ודוחף את המיזם בהתמדה.

תודה רבה גם לוועדת החדשנות על התמיכה והאמון.

מהיום אני עם תג קבוע לבורסה, ואשמח לפגוש כל אחד ואחת מכם גם באופן אישי – להכיר, להקשיב, ולבנות יחד עתיד חכם וטוב יותר לענף.

אני מזמין אתכם לתאם פגישה אישית או דמו, כדי שנוכל להתקדם ביחד ולהפיק את המקסימום מהכלים החדשים.
פנו אליי בפרטי – ואשמח לסייע.

תודה על האמון והשותפות.
חד נמשיך להציע את המערכת קדימה.
            </div>
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
            💎 הודעה תכלול כפתור לינק לקבוצת הליבה: https://t.me/+VhmlB_31N_NmMzJk
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={sendTestMessage}
            disabled={isLoading}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'שולח...' : 'שלח הודעת בדיקה למנהל'}
          </Button>
          
          <Button 
            onClick={sendAnnouncementToAll}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'שולח...' : `שלח לכל המשתמשים (${userCounts.length})`}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2" dir="rtl">
          <p className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            קישור עמוק לקבוצת הליבה עם כפתור מובנה
          </p>
          <p className="mt-1 text-green-600">
            ✓ הודעה בעברית עם תמיכה RTL מלאה
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
