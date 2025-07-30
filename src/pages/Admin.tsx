
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { TestNotificationSender } from '@/components/admin/TestNotificationSender';
import { WelcomeMessageSender } from '@/components/admin/WelcomeMessageSender';
import { UploadReminderNotifier } from '@/components/admin/UploadReminderNotifier';
import { ZeroDiamondUsersNotifier } from '@/components/admin/ZeroDiamondUsersNotifier';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { PersonalizedOutreachSystem } from '@/components/admin/PersonalizedOutreachSystem';
import { DailyActivityDashboard } from '@/components/admin/DailyActivityDashboard';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';

interface User {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
  last_active?: string;
}

const Admin = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { enhancedUsers, getUserEngagementScore, getUserStats } = useEnhancedAnalytics();
  const { blockedUsers } = useBlockedUsers();

  // Calculate stats for AdminStatsGrid
  const stats = getUserStats();
  const blockedUsersCount = blockedUsers.length;
  const averageEngagement = enhancedUsers.length > 0 
    ? Math.round(enhancedUsers.reduce((sum, user) => sum + getUserEngagementScore(user), 0) / enhancedUsers.length)
    : 0;

  return (
    <AdminGuard>
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">פאנל ניהול</h1>
            <p className="text-muted-foreground">
              נהל משתמשים, שלח הודעות ועקוב אחר סטטיסטיקות המערכת
            </p>
          </div>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="stats">סטטיסטיקות</TabsTrigger>
            <TabsTrigger value="activity">פעילות יומית</TabsTrigger>
            <TabsTrigger value="users">משתמשים</TabsTrigger>
            <TabsTrigger value="notifications">הודעות</TabsTrigger>
            <TabsTrigger value="outreach">יצירת קשר</TabsTrigger>
            <TabsTrigger value="reminders">תזכורות</TabsTrigger>
            <TabsTrigger value="payments">תשלומים</TabsTrigger>
            <TabsTrigger value="tools">כלים</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <AdminStatsGrid 
              stats={stats}
              blockedUsersCount={blockedUsersCount}
              averageEngagement={averageEngagement}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <DailyActivityDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUserManager />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <TestNotificationSender />
              <WelcomeMessageSender />
            </div>
          </TabsContent>

          <TabsContent value="outreach" className="space-y-6">
            <PersonalizedOutreachSystem />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <UploadReminderNotifier />
              <ZeroDiamondUsersNotifier />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>כלי ניהול נוספים</CardTitle>
                <CardDescription>
                  כלים נוספים לניהול המערכת יתווספו כאן
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">בקרוב...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Modal */}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </AdminGuard>
  );
};

export default Admin;
