
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { SFTPSettings } from "@/components/settings/SFTPSettings";

export default function SettingsPage() {
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
        <SFTPSettings />
      </div>
    </TelegramLayout>
  );
}
