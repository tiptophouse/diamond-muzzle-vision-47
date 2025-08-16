
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { SFTPAccountManager } from "@/components/sftp/SFTPAccountManager";

export default function SFTPSettingsPage() {
  return (
    <TelegramLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SFTP Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your SFTP account for bulk diamond uploads
          </p>
        </div>
        
        <SFTPAccountManager />
      </div>
    </TelegramLayout>
  );
}
