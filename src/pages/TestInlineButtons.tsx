import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export default function TestInlineButtons() {
  const { user } = useTelegramAuth();
  const [telegramId, setTelegramId] = useState(user?.id?.toString() || "");
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    if (!telegramId) {
      toast.error("אנא הכנס מזהה טלגרם");
      return;
    }

    setIsSending(true);
    
    try {
      console.log('🧪 Sending test notification to:', telegramId);
      
      const { data, error } = await supabase.functions.invoke('test-inline-buttons', {
        body: { telegram_id: parseInt(telegramId) }
      });

      if (error) throw error;

      console.log('✅ Test sent:', data);
      
      toast.success(
        "✅ הודעת בדיקה נשלחה!",
        {
          description: "בדוק את הטלגרם שלך ולחץ על הכפתורים"
        }
      );
    } catch (error) {
      console.error('❌ Error sending test:', error);
      toast.error("שגיאה בשליחת הבדיקה", {
        description: error.message
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 בדיקת כפתורים קבועים (Inline Buttons)</CardTitle>
          <CardDescription>
            שלח הודעת בדיקה לטלגרם עם כפתורים מתוקנים שפותחים את המיני-אפ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="telegram_id">מזהה טלגרם (Telegram ID)</Label>
            <Input
              id="telegram_id"
              type="number"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              placeholder="לדוגמה: 2138564172"
              dir="ltr"
            />
            <p className="text-sm text-muted-foreground">
              {user ? `המזהה שלך: ${user.id}` : "הזן את מזהה הטלגרם שלך"}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">מה יקרה:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>תקבל תמונה עם הודעה בטלגרם</li>
              <li>תחתיה יהיו 4 כפתורים: 3 כפתורי יהלום + כפתור "לכל המלאי"</li>
              <li>כל כפתור ייפתח את המיני-אפ בעמוד הרלוונטי</li>
              <li>הכפתורים משתמשים בפורמט הנכון: <code className="text-xs">https://t.me/BOT?startapp=param</code></li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 איך לבדוק:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>לחץ על "שלח בדיקה" למטה</li>
              <li>פתח את הטלגרם שלך</li>
              <li>חפש את ההודעה מהבוט</li>
              <li>לחץ על כל אחד מהכפתורים</li>
              <li>ודא שהמיני-אפ נפתח בעמוד הנכון</li>
            </ol>
          </div>

          <Button 
            onClick={handleSendTest}
            disabled={isSending || !telegramId}
            className="w-full"
            size="lg"
          >
            {isSending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שולח בדיקה...
              </>
            ) : (
              "🚀 שלח בדיקה"
            )}
          </Button>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              ⚠️ שים לב:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
              <li>אפשר לשלוח רק לטלגרם שלך או של משתמשים שפתחו שיחה עם הבוט</li>
              <li>הכפתורים יעבדו רק מתוך אפליקציית טלגרם (לא מהדפדפן)</li>
              <li>אם הכפתור לא עובד, ייתכן שצריך להוסיף את ה-TELEGRAM_BOT_USERNAME</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
