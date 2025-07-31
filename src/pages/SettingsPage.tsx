
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { AccountSettings } from "@/components/settings/AccountSettings";

export default function SettingsPage() {
  return (
    <TelegramLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and account preferences
          </p>
        </div>
        
        <AccountSettings />
      </div>
    </TelegramLayout>
  );
}
