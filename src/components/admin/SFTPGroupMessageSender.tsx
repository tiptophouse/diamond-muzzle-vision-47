import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export function SFTPGroupMessageSender() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sftpMessage = `🔗 **BrilliantBot – חיבור חדש למשתמשי Acadia 💎**

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

  const sendSFTPGroupMessage = async () => {
    setIsLoading(true);
    
    try {
      console.log('📤 Sending SFTP group message...');
      
      const { data, error } = await supabase.functions.invoke('send-group-cta', {
        body: {
          message: sftpMessage,
          useButtons: true,
          buttonText: '🔗 התחבר עכשיו',
          buttonUrl: 'https://t.me/diamondmazalbot?start=provide_sftp'
        }
      });

      if (error) {
        console.error('❌ Failed to send SFTP message:', error);
        toast({
          title: "❌ Failed to send message",
          description: error.message || "Could not send the SFTP message to the group",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ SFTP group message sent:', data);
      toast({
        title: "✅ Message Sent Successfully!",
        description: `SFTP connection message sent to the group with direct bot link`,
      });

    } catch (error) {
      console.error('❌ Error sending SFTP group message:', error);
      toast({
        title: "❌ Error",
        description: "Failed to send the SFTP message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📡 SFTP Group Message - Acadia Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Message Preview:</h3>
          <div className="text-sm whitespace-pre-wrap text-muted-foreground">
            {sftpMessage}
          </div>
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded inline-block">
            <span className="text-blue-700 font-medium">🔗 התחבר עכשיו</span>
            <span className="text-xs text-blue-600 block">→ https://t.me/diamondmazalbot?start=provide_sftp</span>
          </div>
        </div>

        <Button 
          onClick={sendSFTPGroupMessage} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              שולח הודעה לקבוצה...
            </>
          ) : (
            '📤 שלח הודעת SFTP לקבוצה'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}