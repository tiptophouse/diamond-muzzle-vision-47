
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { NotificationSender } from '@/components/admin/NotificationSender';
import { PersonalizedOutreachSystem } from '@/components/admin/PersonalizedOutreachSystem';
import { TestNotificationSender } from '@/components/admin/TestNotificationSender';
import { SelectiveNotificationSender } from '@/components/admin/SelectiveNotificationSender';
import { BlockedUsersManager } from '@/components/admin/BlockedUsersManager';
import { WelcomeMessageSender } from '@/components/admin/WelcomeMessageSender';
import { UploadReminderNotifier } from '@/components/admin/UploadReminderNotifier';
import { ZeroDiamondUsersNotifier } from '@/components/admin/ZeroDiamondUsersNotifier';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface User {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
}

const Admin = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();

  // Check if user is admin (using your specific admin ID)
  const isAdmin = user?.id === 2138564172;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please authenticate to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, notifications, and system settings
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminStatsGrid 
            stats={{
              totalUsers: 0,
              activeUsers: 0,
              totalDiamonds: 0,
              recentSignups: 0
            }}
            blockedUsersCount={0}
            averageEngagement={0}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <AdminUserManager />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6">
            <NotificationSender />
            <PersonalizedOutreachSystem />
            <TestNotificationSender />
            <SelectiveNotificationSender />
            <WelcomeMessageSender />
            <UploadReminderNotifier />
            <ZeroDiamondUsersNotifier />
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentManagement />
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <BlockedUsersManager />
      </div>
    </div>
  );
};

export default Admin;
