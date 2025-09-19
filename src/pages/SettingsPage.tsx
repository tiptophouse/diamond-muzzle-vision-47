
import { TelegramMiniAppLayout } from "@/components/layout/TelegramMiniAppLayout";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { SFTPSettings } from "@/components/settings/SFTPSettings";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <TelegramMiniAppLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <Settings className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>
        
        <AccountSettings />
        <SFTPSettings />
      </div>
    </TelegramMiniAppLayout>
  );
}
