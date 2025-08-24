
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { SFTPSettings } from "@/components/settings/SFTPSettings";

export default function SettingsPage() {
  // Handle SFTP connection results for potential Telegram notifications
  const handleConnectionResult = (status: "success" | "failed" | "pending", details: any) => {
    console.log('🔔 SFTP Connection Result:', { status, details });
    
    // This is where you can wire the Telegram bot notifications
    // Example: Call your backend endpoint to send Telegram message
    /*
    if (status === "success") {
      // Send success notification via Telegram bot
      fetch('/api/v1/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `✅ SFTP ready. Host ${details.host}; user ${details.username}; upload to /inbox.`
        })
      });
    } else if (status === "failed") {
      // Send failure notification with retry options
      fetch('/api/v1/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "❌ SFTP connection failed.",
          inline_keyboard: [
            [{ text: "Retry", callback_data: "sftp_retry" }],
            [{ text: "Help", callback_data: "sftp_help" }]
          ]
        })
      });
    }
    */
  };

  return (
    <TelegramLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">הגדרות חשבון</h1>
          <p className="text-muted-foreground mt-1">
            נהל את המידע האישי שלך והעדפות החשבון
          </p>
        </div>
        
        <AccountSettings />
        
        {/* FTP Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">FTP</h2>
            <p className="text-muted-foreground text-sm">
              נהל חיבורי SFTP לטעינת קבצי יהלומים
            </p>
          </div>
          <SFTPSettings onConnectionResult={handleConnectionResult} />
        </div>
      </div>
    </TelegramLayout>
  );
}
