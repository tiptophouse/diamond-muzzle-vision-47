
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
import { Loader2 } from 'lucide-react';

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
  const { enhancedUsers, isLoading, getUserEngagementScore, getUserStats, refetch } = useEnhancedAnalytics();
  const { blockedUsers, isLoading: blockedLoading } = useBlockedUsers();

  // Calculate stats for AdminStatsGrid
  const stats = getUserStats();
  const blockedUsersCount = blockedUsers.length;
  const averageEngagement = enhancedUsers.length > 0 
    ? Math.round(enhancedUsers.reduce((sum, user) => sum + getUserEngagementScore(user), 0) / enhancedUsers.length)
    : 0;

  console.log('Admin Data Debug:', {
    enhancedUsers: enhancedUsers.length,
    blockedUsers: blockedUsersCount,
    stats,
    isLoading,
    blockedLoading
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">פאנל ניהול</h1>
            <p className="text-muted-foreground">
              נהל משתמשים, שלח הודעות ועקוב אחר סטטיסטיקות המערכת
            </p>
            <p className="text-sm text-blue-600 mt-2">
              סך הכל {enhancedUsers.length} משתמשים | חסומים: {blockedUsersCount}
            </p>
          </div>
          <button
            onClick={() => {
              console.log('Refreshing admin data...');
              refetch();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            רענן נתונים
          </button>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="stats">סטטיסטיקות</TabsTrigger>
            <TabsTrigger value="activity">פעילות יומית</TabsTrigger>
            <TabsTrigger value="users">משתמשים ({enhancedUsers.length})</TabsTrigger>
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
            
            {/* Debug Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">מידע דיבוג</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>משתמשים פעילים:</strong> {stats.totalUsers}
                  </div>
                  <div>
                    <strong>משתמשים חסומים:</strong> {blockedUsersCount}
                  </div>
                  <div>
                    <strong>משתמשי פרימיום:</strong> {stats.premiumUsers}
                  </div>
                  <div>
                    <strong>ממוצע מעורבות:</strong> {averageEngagement}%
                  </div>
                </div>
              </CardContent>
            </Card>
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
