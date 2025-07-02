
import { Layout } from "@/components/layout/Layout";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { TelegramIntegration } from "@/components/settings/TelegramIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your Diamond Muzzle preferences and account settings
          </p>
        </div>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <AccountSettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <PrivacySettings />
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-6">
            <TelegramIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
