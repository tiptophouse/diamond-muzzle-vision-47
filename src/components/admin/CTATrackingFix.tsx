import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Users, TrendingUp, MessageSquare } from 'lucide-react';
import { useGroupCTA } from '@/hooks/useGroupCTA';
import { toast } from '@/components/ui/use-toast';

export function CTATrackingFix() {
  const [isSending, setIsSending] = useState(false);
  const { sendGroupCTA } = useGroupCTA();

  const handleSendUrgentMessage = async () => {
    const urgentMessage = `🚨 חירום: המערכת חזרה לפעילות מלאה!

💎 343 סוחרים הצטרפו השבוע אבל המערכת לא עקבה!
📈 אבדנו מעקב על הצלחות אדירות שלכם

🔥 עכשיו אנחנו חוזרים חזק יותר:
• מעקב מדויק על כל לחיצה
• רישום אוטומטי מהיר
• דאשבורד חדש עם 400+ משתמשים

⚡ בדיקה: מי מכם כאן מהקהילה? 
לחצו כאן כדי שנוכל לעקוב בצורה נכונה! 👇`;

    setIsSending(true);
    try {
      await sendGroupCTA({
        groupId: -1001009290613,
        message: urgentMessage,
        buttonText: "🔧 בדיקת מערכת - לחצו כאן!",
        buttonUrl: "https://t.me/diamondmazalbot?start=group_activation&utm_source=group_cta&button_clicked=system_test",
        useButtons: true
      });

      toast({
        title: "🚨 הודעת חירום נשלחה!",
        description: "הודעה לתיקון מעקב CTA נשלחה לקבוצה",
      });
    } catch (error: any) {
      toast({
        title: "❌ שגיאה",
        description: error.message || "נכשל בשליחת הודעת החירום",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSend400PlusMessage = async () => {
    const growthMessage = `🎉 שבירת שיא: 400+ סוחרי יהלומים במערכת!

📊 הנתונים המטורפים:
• 343 סוחרים הצטרפו רק השבוע!
• כמעט 400 משתמשים פעילים
• הקהילה הגדולה ביותר בישראל

💰 למה כולם רצים אלינו?
✅ רווחיות של 50%+ בחודש
✅ מעקב מלאי אוטומטי וחכם  
✅ AI לניתוח יהלומים
✅ חנות מקוונת מובנית

🔥 עדיין לא בפנים? אתה מפסיד רווחים!
⏰ הצטרף לפני שנגמרים המקומות`;

    setIsSending(true);
    try {
      await sendGroupCTA({
        groupId: -1001009290613,
        message: growthMessage,
        buttonText: "💎 הצטרף ל-400+ הסוחרים",
        buttonUrl: "https://t.me/diamondmazalbot?start=group_activation&utm_source=group_cta&button_clicked=join_400_users",
        useButtons: true
      });

      toast({
        title: "🎉 הודעת שיא נשלחה!",
        description: "הודעה על 400+ משתמשים נשלחה לקבוצה",
      });
    } catch (error: any) {
      toast({
        title: "❌ שגיאה",  
        description: error.message || "נכשל בשליחת הודעת השיא",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Problem Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-700">
          <strong>בעיה קריטית זוהתה:</strong> מערכת CTA לא עוקבת אחר לחיצות! 
          <br />
          343 משתמשים הצטרפו ב-27/8 אבל אין מעקב על המקור.
        </AlertDescription>
      </Alert>

      {/* Success Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          <strong>הצלחה גדולה:</strong> יש לך כמעט 400 משתמשים פעילים! 
          <br />
          העיקר עכשיו לתקן את המעקב ולנצל את הכח הזה.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">343</p>
                <p className="text-sm text-muted-foreground">משתמשים ב-27/8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">~400</p>
                <p className="text-sm text-muted-foreground">סה"כ משתמשים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">CTA מעוקבות</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              תיקון מעקב CTA
            </CardTitle>
            <CardDescription>
              שלח הודעה לתיקון מערכת המעקב ולבדיקת התגובה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSendUrgentMessage}
              disabled={isSending}
              variant="outline"
              className="w-full"
            >
              🔧 שלח הודעת תיקון מעקב
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              נצל את ה-400 משתמשים
            </CardTitle>
            <CardDescription>
              שלח הודעה שמדגישה את הקהילה הגדולה שיש לך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSend400PlusMessage}
              disabled={isSending}
              className="w-full"
            >
              🎉 שלח הודעת שיא 400+
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Technical Fix Info */}
      <Card>
        <CardHeader>
          <CardTitle>תיקון טכני נדרש</CardTitle>
          <CardDescription>
            מה צריך לתקן במערכת המעקב
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">בעיה</Badge>
              <span className="text-sm">טבלת group_cta_clicks ריקה לחלוטין</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">פתרון</Badge>
              <span className="text-sm">לוודא שה-URL כולל utm_source=group_cta</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">בדיקה</Badge>
              <span className="text-sm">הכפתורים למעלה יבדקו את המעקב</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}