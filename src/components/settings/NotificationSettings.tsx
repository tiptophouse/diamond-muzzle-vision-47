
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Bell, MessageSquare, TrendingUp, Mail, Save } from 'lucide-react';

export function NotificationSettings() {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inventoryAlerts: true,
    priceAlerts: false,
    chatMessages: true,
    systemUpdates: true,
    marketingEmails: false,
    weeklyReports: true,
    mobileNotifications: true,
    desktopNotifications: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Notification preferences saved",
        description: "Your notification settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Notifications
          </h3>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications" className="text-sm font-normal">
                Enable email notifications
              </Label>
              <Switch
                id="emailNotifications"
                checked={notifications.emailNotifications}
                onCheckedChange={() => updateSetting('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyReports" className="text-sm font-normal">
                Weekly activity reports
              </Label>
              <Switch
                id="weeklyReports"
                checked={notifications.weeklyReports}
                onCheckedChange={() => updateSetting('weeklyReports')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="marketingEmails" className="text-sm font-normal">
                Marketing emails and promotions
              </Label>
              <Switch
                id="marketingEmails"
                checked={notifications.marketingEmails}
                onCheckedChange={() => updateSetting('marketingEmails')}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            App Notifications
          </h3>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications" className="text-sm font-normal">
                Push notifications in Telegram
              </Label>
              <Switch
                id="pushNotifications"
                checked={notifications.pushNotifications}
                onCheckedChange={() => updateSetting('pushNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="chatMessages" className="text-sm font-normal">
                New chat messages
              </Label>
              <Switch
                id="chatMessages"
                checked={notifications.chatMessages}
                onCheckedChange={() => updateSetting('chatMessages')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="systemUpdates" className="text-sm font-normal">
                System updates and announcements
              </Label>
              <Switch
                id="systemUpdates"
                checked={notifications.systemUpdates}
                onCheckedChange={() => updateSetting('systemUpdates')}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Business Alerts
          </h3>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="inventoryAlerts" className="text-sm font-normal">
                Inventory alerts and updates
              </Label>
              <Switch
                id="inventoryAlerts"
                checked={notifications.inventoryAlerts}
                onCheckedChange={() => updateSetting('inventoryAlerts')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="priceAlerts" className="text-sm font-normal">
                Price change alerts
              </Label>
              <Switch
                id="priceAlerts"
                checked={notifications.priceAlerts}
                onCheckedChange={() => updateSetting('priceAlerts')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
