
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGroupCTA } from '@/hooks/useGroupCTA';
import { useToast } from '@/components/ui/use-toast';
import { Send, Users, Sparkles, Rocket, Diamond, Zap } from 'lucide-react';

export function GroupLaunchMessage() {
  const { sendGroupCTA, isLoading } = useGroupCTA();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const launchMessage = `🚀 **BrilliantBot - המהפכה החדשה בעולם היהלומים!**

💎 **ברוכים הבאים לעתיד המסחר ביהלומים!**

🌟 **מה זה BrilliantBot?**
• 🤖 **בוט חכם** שמנטר 24/7 את כל קבוצות היהלומים
• 📊 **ניהול מלאי דיגיטלי** - כל האבנים שלכם במקום אחד
• 🎯 **התאמה אוטומטית** - קבלו התראות כשיש ביקוש לאבנים שלכם
• 💰 **אופטימיזציה של רווחים** - מחירים חכמים ותחזיות שוק
• 🔍 **חיפוש מתקדם** - מצאו בדיוק מה שהלקוחות מחפשים

⚡ **למה אתם צריכים את זה עכשיו?**
✅ חיסכון של שעות בחיפוש ומעקב
✅ אפס החמצות של עסקאות רווחיות  
✅ מלאי מסונכרן עם כל הפלטפורמות
✅ בינה מלאכותית שעובדת בשבילכם 24/7
✅ דיווחים ותחזיות שוק מתקדמות

🎁 **השקה מיוחדת - חינם לחודש הראשון!**

👇 **התחילו עכשיו - בחרו את החלק שמעניין אתכם:**`;

  const sendLaunchMessage = async () => {
    setIsSending(true);
    try {
      const success = await sendGroupCTA({
        message: launchMessage,
        groupId: -1001009290613,
        useButtons: true,
        buttonText: '🚀 גלו את BrilliantBot',
        buttonUrl: 'https://t.me/diamondmazalbot?startapp=launch_campaign'
      });

      if (success) {
        toast({
          title: "🎉 הודעת השקה נשלחה!",
          description: "ההודעה עם הכפתורים האינטראקטיביים נשלחה ל-1700 חברי הקבוצה",
        });
      }
    } catch (error) {
      console.error('Error sending launch message:', error);
      toast({
        title: "שגיאה בשליחה",
        description: "נכשל בשליחת הודעת השקה",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-blue-500" />
          הודעת השקה לקבוצה (1,700 חברים)
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            1,700 חברים
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            כפתורים אינטראקטיביים
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Preview */}
        <div className="bg-muted/50 p-4 rounded-lg border-r-4 border-blue-500">
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {launchMessage}
          </div>
          
          {/* Mock Telegram Inline Keyboards */}
          <div className="mt-4 space-y-2">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-center text-sm font-medium">
              🏠 Dashboard - סקירה כללית
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-500 text-white px-3 py-2 rounded text-center text-xs">
                📦 Inventory - המלאי שלי
              </div>
              <div className="bg-purple-500 text-white px-3 py-2 rounded text-center text-xs">
                🏪 Store - חנות יהלומים
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-orange-500 text-white px-3 py-2 rounded text-center text-xs">
                💬 Chat - עוזר חכם
              </div>
              <div className="bg-red-500 text-white px-3 py-2 rounded text-center text-xs">
                📊 Insights - תחזיות
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium">
              <Zap className="inline h-4 w-4 mr-1" />
              התחילו עכשיו - השקה מיוחדת!
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <Button 
          onClick={sendLaunchMessage}
          disabled={isSending || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          size="lg"
        >
          {isSending || isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              שולח הודעת השקה ל-1,700 חברים...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              שלח הודעת השקה עם כפתורים אינטראקטיביים
            </>
          )}
        </Button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Diamond className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">הכפתורים האינטראקטיביים יובילו ישירות ל:</p>
              <ul className="text-xs space-y-1">
                <li>• Dashboard - סקירה כללית של המערכת</li>
                <li>• Inventory - ניהול מלאי יהלומים אישי</li>
                <li>• Store - גלישה בחנות היהלומים</li>
                <li>• Chat - עוזר בינה מלאכותית</li>
                <li>• Insights - תחזיות ואנליטיקה</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
