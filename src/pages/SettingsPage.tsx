
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { SFTPSettings } from "@/components/settings/SFTPSettings";
import { useTelegramSendData } from "@/hooks/useTelegramSendData";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { sendData, isAvailable: telegramAvailable } = useTelegramSendData();
  const { toast } = useToast();

  // Handle SFTP connection results with active Telegram notifications
  const handleConnectionResult = (status: "success" | "failed" | "pending", details: any) => {
    console.log('🔔 SFTP Connection Result:', { status, details });
    
    // Send notification via Telegram bot
    if (telegramAvailable) {
      let message = "";
      let inline_keyboard = null;

      switch (status) {
        case "success":
          message = `✅ SFTP ready! Host: ${details.host || '136.0.3.22'}, Upload to: /inbox`;
          break;
        
        case "failed":
          message = `❌ SFTP connection failed: ${details.last_event || 'Unknown error'}`;
          inline_keyboard = [
            [{ text: "🔄 Retry", callback_data: "sftp_retry" }],
            [{ text: "❓ Help", callback_data: "sftp_help" }]
          ];
          break;
        
        case "pending":
          message = "⏳ SFTP connection is being tested in the background...";
          break;
      }

      const notificationPayload = {
        action: 'sftp_notification',
        data: {
          message,
          inline_keyboard,
          status,
          details
        },
        timestamp: Date.now()
      };

      const success = sendData(notificationPayload);
      
      if (success) {
        console.log('📤 SFTP notification sent to Telegram bot');
        toast({
          title: "📱 הודעה נשלחה",
          description: "עדכון סטטוס SFTP נשלח לטלגרם",
        });
      } else {
        console.error('❌ Failed to send SFTP notification to Telegram bot');
        toast({
          title: "⚠️ שגיאה בשליחת הודעה",
          description: "לא ניתן לשלוח עדכון לטלגרם",
          variant: "destructive",
        });
      }
    } else {
      console.warn('⚠️ Telegram WebApp not available for notifications');
      toast({
        title: "⚠️ טלגרם לא זמין",
        description: "לא ניתן לשלוח הודעות דרך הבוט",
        variant: "destructive",
      });
    }
  };

  return (
    <TelegramLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">הגדרות חשבון</h1>
          <p className="text-muted-foreground mt-1">
            נהל את המידע האישי שלך והעדפות החשבון
          </p>
          {telegramAvailable && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <span>📱</span>
              <span>מחובר לטלגרם - הודעות פעילות</span>
            </div>
          )}
        </div>
        
        <AccountSettings />
        
        {/* SFTP Section with Active Notifications */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">SFTP</h2>
            <p className="text-muted-foreground text-sm">
              נהל חיבורי SFTP לטעינת קבצי יהלומים - הודעות אוטומטיות בטלגרם
            </p>
          </div>
          <SFTPSettings onConnectionResult={handleConnectionResult} />
        </div>
      </div>
    </TelegramLayout>
  );
}
