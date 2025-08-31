
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, Send, TestTube, Users, Sparkles } from 'lucide-react';

export function GroupLaunchMessage() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const launchMessage = `🚀 **הפתעה גדולה! BrilliantBot בא לשנות את חיי הסוחרים** 💎

🔥 **למה 1,700 סוחרי יהלומים מחכים לזה?**

✨ **BrilliantBot זה לא עוד בוט - זה המהפכה שלכם:**
🏪 **חנות וירטואלית חכמה** - הציגו את היהלומים באופן מקצועי
📊 **דשבורד אנליטי מתקדם** - תובנות עסקיות בזמן אמת  
💬 **בינה מלאכותית יועצת** - המומחה האישי שלכם 24/7
📈 **מערכת ניהול מלאי חכמה** - כל היהלומים במקום אחד
🎯 **תובנות שוק מתקדמות** - הישארו צעד אחד קדימה

⚡ **הטבה מוגבלת לחברי הקבוצה:**
🎁 **גישה חינמית ל-30 יום ראשונים**
💰 **הנחה של 70% לחברי הקבוצה** 
🏆 **תמיכה אישית VIP**
📱 **הכשרה מלאה על המערכת**

⏰ **זמן מוגבל! רק ל-100 הראשונים**

👇 **בחרו את המסע שלכם:**`;

  const sendTestMessage = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId: 2138564172, // Admin telegram ID
          message: `🧪 **בדיקת מנהל - הודעת השקה לקבוצה**\n\n${launchMessage}`,
          buttons: [
            {
              text: '🏪 חנות וירטואלית',
              url: 'https://t.me/diamondmazalbot?startapp=store'
            },
            {
              text: '📊 דשבורד מנהלים',
              url: 'https://t.me/diamondmazalbot?startapp=dashboard'
            },
            {
              text: '📦 ניהול מלאי חכם',
              url: 'https://t.me/diamondmazalbot?startapp=inventory'
            },
            {
              text: '💬 יועץ AI אישי',
              url: 'https://t.me/diamondmazalbot?startapp=chat'
            },
            {
              text: '📈 תובנות עסקיות',
              url: 'https://t.me/diamondmazalbot?startapp=insights'
            },
            {
              text: '🎯 הצטרפות VIP מיידית',
              url: 'https://t.me/diamondmazalbot?startapp=profile&utm_source=group_launch&utm_campaign=vip_access&promo=GROUP70'
            }
          ]
        }
      });

      if (error) throw error;

      toast({
        title: "✅ בדיקה נשלחה בהצלחה!",
        description: "בדוק את הטלגרם שלך לראות איך ההודעה נראית עם הכפתורים",
      });

    } catch (error: any) {
      console.error('Error sending test message:', error);
      toast({
        title: "❌ שגיאה בבדיקה",
        description: error.message || "נכשל בשליחת הודעת הבדיקה",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const sendToGroup = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-group-cta', {
        body: {
          message: launchMessage,
          groupId: -1001009290613, // Your group ID
          useButtons: true,
          buttonText: '🚀 כנסו ל-BrilliantBot עכשיו',
          buttonUrl: 'https://t.me/diamondmazalbot?startapp=profile&utm_source=group_launch&utm_campaign=1700_members'
        }
      });

      if (error) throw error;

      toast({
        title: "🎉 ההודעה נשלחה ל-1,700 חברים!",
        description: "הודעת ההשקה נשלחה בהצלחה לכל הקבוצה",
      });

    } catch (error: any) {
      console.error('Error sending group message:', error);
      toast({
        title: "❌ שגיאה בשליחה",
        description: error.message || "נכשל בשליחת ההודעה לקבוצה",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Rocket className="h-6 w-6" />
          הודעת השקה מיוחדת - 1,700 חברים
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </CardTitle>
        <CardDescription className="text-base">
          הודעה מותאמת אישית עם כפתורים אינטראקטיביים לכל חלקי המערכת
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Preview */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-800">
          <h4 className="font-bold mb-3 text-blue-700 dark:text-blue-300">תצוגה מקדימה של ההודעה:</h4>
          <div className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded max-h-64 overflow-y-auto">
            {launchMessage}
          </div>
        </div>

        {/* Buttons Preview */}
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300">כפתורים אינטראקטיביים שיישלחו:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-blue-700 dark:text-blue-300">🏪 חנות וירטואלית</div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded text-purple-700 dark:text-purple-300">📊 דשבורד מנהלים</div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-green-700 dark:text-green-300">📦 ניהול מלאי חכם</div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded text-orange-700 dark:text-orange-300">💬 יועץ AI אישי</div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded text-red-700 dark:text-red-300">📈 תובנות עסקיות</div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-yellow-700 dark:text-yellow-300">🎯 הצטרפות VIP מיידית</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={sendTestMessage} 
            disabled={isTesting}
            variant="outline"
            className="flex-1 border-blue-500 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-950/20"
            size="lg"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2" />
                שולח בדיקה...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                🧪 שלח לי בדיקה (מנהל)
              </>
            )}
          </Button>

          <Button 
            onClick={sendToGroup} 
            disabled={isSending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                שולח ל-1,700 חברים...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                🚀 שלח ל-1,700 חברי הקבוצה
              </>
            )}
          </Button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>הערה חשובה:</strong> בדוק תחילה את ההודעה על ידי שליחה לעצמך לפני השליחה לכל הקבוצה
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
