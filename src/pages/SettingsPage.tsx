
import { Layout } from "@/components/layout/Layout";
import { AccountSettings } from "@/components/settings/AccountSettings";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your Diamond Muzzle account settings
          </p>
        </div>
        
        <AccountSettings />
      </div>
    </Layout>
  );
}
