
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { PersonalizedOutreachSystem } from '@/components/admin/PersonalizedOutreachSystem';
import { DiamondShareAnalytics } from '@/components/admin/DiamondShareAnalytics';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UserUploadAnalysis } from '@/components/admin/UserUploadAnalysis';
import { ZeroDiamondUsersNotifier } from '@/components/admin/ZeroDiamondUsersNotifier';
import { SelectiveNotificationSender } from '@/components/admin/SelectiveNotificationSender';
import { UploadReminderNotifier } from '@/components/admin/UploadReminderNotifier';
import { WelcomeMessageSender } from '@/components/admin/WelcomeMessageSender';
import { TestNotificationSender } from '@/components/admin/TestNotificationSender';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';
import { OnboardingMessagePreview } from '@/components/admin/OnboardingMessagePreview';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { BlockedUsersManager } from '@/components/admin/BlockedUsersManager';
import { DailyActivityDashboard } from '@/components/admin/DailyActivityDashboard';
import { useAdminActions } from '@/hooks/useAdminActions';

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const {
    users,
    filteredUsers,
    blockedUsersCount,
    notifications,
    stats,
    averageEngagement,
    isLoading,
    error,
    getUserEngagementScore,
    refreshData,
    handleBlockUser,
    handleUnblockUser,
    handleDeleteUser,
    handlePromoteUser
  } = useAdminActions(searchTerm);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading admin panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <AdminHeader 
          onExportData={() => console.log('Export functionality')}
          onAddUser={() => console.log('Add user functionality')}
        />
        
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="activity">Today's Activity</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="outreach">Outreach</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            <DailyActivityDashboard />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <AdminStatsGrid 
              stats={stats} 
              blockedUsersCount={blockedUsersCount} 
              averageEngagement={averageEngagement} 
            />
            <AdminUserTable
              filteredUsers={filteredUsers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              getUserEngagementScore={getUserEngagementScore}
              isUserBlocked={(telegramId: number) => false}
              onViewUser={(user: any) => setSelectedUserId(user.id)}
              onEditUser={(user: any) => console.log('Edit user:', user)}
              onToggleBlock={(user: any) => handleBlockUser(user)}
              onDeleteUser={(user: any) => handleDeleteUser(user)}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserUploadAnalysis />
            <AdminUserTable
              filteredUsers={filteredUsers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              getUserEngagementScore={getUserEngagementScore}
              isUserBlocked={(telegramId: number) => false}
              onViewUser={(user: any) => setSelectedUserId(user.id)}
              onEditUser={(user: any) => console.log('Edit user:', user)}
              onToggleBlock={(user: any) => handleBlockUser(user)}
              onDeleteUser={(user: any) => handleDeleteUser(user)}
            />
          </TabsContent>

          <TabsContent value="outreach" className="space-y-6">
            <PersonalizedOutreachSystem />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WelcomeMessageSender />
              <UploadReminderNotifier />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ZeroDiamondUsersNotifier />
              <SelectiveNotificationSender />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter 
              notifications={notifications} 
              onRefresh={refreshData} 
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TestNotificationSender />
              <OnboardingMessagePreview 
                sessionUsers={[]}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <DiamondShareAnalytics />
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>
                  Detailed analytics and user behavior insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                    <div className="text-sm text-blue-600">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                    <div className="text-sm text-green-600">Active Users</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{averageEngagement}%</div>
                    <div className="text-sm text-purple-600">Avg Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentManagement />
              <BlockedUsersManager />
            </div>
          </TabsContent>
        </Tabs>

        {selectedUserId && (
          <UserDetailsModal
            user={filteredUsers.find(u => u.id === selectedUserId)}
            isOpen={true}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </div>
    </AdminGuard>
  );
};

export default AdminPage;
