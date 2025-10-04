import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TestTube } from 'lucide-react';

export function SFTPTestMessageSender() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Admin Telegram ID for testing
  const adminTelegramId = 2138564172;

  const sftpTestMessage = `🔗 **BrilliantBot – חיבור חדש למשתמשי Acadia 💎**

מהיום, כל שינוי שתעשו במערכת Acadia – מחיקה, עדכון או הוספה – יסתנכרן אוטומטית עם BrilliantBot!
כך תוכלו לקבל התראות בזמן אמת ולעבוד בצורה חכמה ומהירה יותר. 🚀

**איך מתחברים?**
1️⃣ היכנסו ל-@diamondmazalbot
2️⃣ הקלידו: /provide_sftp או לחצו על Menu → Generate SFTP
3️⃣ הבוט ייצור עבורכם פרטי חיבור אישיים
4️⃣ העתיקו את ההודעה ושלחו אותה ל-Acadia
5️⃣ לאחר החיבור, כל פעולה ב-Acadia תופיע גם ב-BrilliantBot אוטומטית

📌 **חשוב לדעת:** השירות מיועד אך ורק למשתמשי Acadia

💼 **BrilliantBot – לא רק למסחר, אלא להפוך את העבודה שלכם ליותר חכמה**`;

  const sendTestMessage = async () => {
    setIsLoading(true);
    
    try {
      console.log('📤 Sending SFTP test message to admin...');
      
      const { data, error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId: adminTelegramId,
          message: sftpTestMessage,
          buttons: [
            {
              text: '🔗 התחבר עכשיו',
              url: 'https://t.me/diamondmazalbot?start=provide_sftp'
            },
            {
              text: '💎 דשבורד ראשי',
              url: 'https://t.me/diamondmazalbot?startapp=profile'
            }
          ]
        }
      });

      if (error) {
        console.error('❌ Failed to send test message:', error);
        toast({
          title: "❌ Failed to send test message",
          description: error.message || "Could not send the test message",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ SFTP test message sent:', data);
      toast({
        title: "✅ Test Message Sent!",
        description: `SFTP test message sent to your Telegram with inline buttons`,
      });

    } catch (error) {
      console.error('❌ Error sending test message:', error);
      toast({
        title: "❌ Error",
        description: "Failed to send the test message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          🧪 SFTP Test Message - Send to Me First
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium mb-2 text-blue-800">Test Message Preview:</h3>
          <div className="text-sm whitespace-pre-wrap text-blue-700 mb-3">
            {sftpTestMessage}
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-blue-100 border border-blue-300 rounded inline-block">
              <span className="text-blue-800 font-medium">🔗 התחבר עכשיו</span>
              <span className="text-xs text-blue-600 block">→ https://t.me/diamondmazalbot?start=provide_sftp</span>
            </div>
            <div className="p-2 bg-blue-100 border border-blue-300 rounded inline-block">
              <span className="text-blue-800 font-medium">💎 דשבורד ראשי</span>
              <span className="text-xs text-blue-600 block">→ https://t.me/diamondmazalbot?startapp=profile</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>📋 Test Instructions:</strong>
            <br />
            1. Click the button below to send the test message to your Telegram
            <br />
            2. Check if the inline buttons work correctly
            <br />
            3. Test the /provide_sftp command button
            <br />
            4. Once verified, use the group message sender to send to the group
          </p>
        </div>

        <Button 
          onClick={sendTestMessage} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              שולח הודעת בדיקה...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              🧪 שלח הודעת בדיקה לטלגרם שלי
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          הודעה תישלח לטלגרם ID: {adminTelegramId}
        </div>
      </CardContent>
    </Card>
  );
}