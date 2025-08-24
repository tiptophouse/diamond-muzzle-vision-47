
import React from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { BlockedUsersManager } from '@/components/admin/BlockedUsersManager';
import { ZeroDiamondUsersNotifier } from '@/components/admin/ZeroDiamondUsersNotifier';
import { MeetingInvitationSender } from '@/components/admin/MeetingInvitationSender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  const handleExportData = () => {
    console.log('Export data functionality to be implemented');
  };

  const handleAddUser = () => {
    console.log('Add user functionality to be implemented');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const mockStats = {
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    totalCosts: 0,
    profit: 0,
  };

  const mockNotifications: any[] = [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminHeader 
        onExportData={handleExportData} 
        onAddUser={handleAddUser} 
      />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6" dir="rtl">
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="users">משתמשים</TabsTrigger>
            <TabsTrigger value="notifications">התראות</TabsTrigger>
            <TabsTrigger value="meetings">פגישות</TabsTrigger>
            <TabsTrigger value="payments">תשלומים</TabsTrigger>
            <TabsTrigger value="blocked">חסומים</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminStatsGrid 
              stats={mockStats} 
              blockedUsersCount={0} 
              averageEngagement={0} 
            />
            <ZeroDiamondUsersNotifier />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUserManager />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg" dir="rtl">
              <p className="text-yellow-800 text-right">
                🚫 מערכת ההתראות מושהית זמנית לתיקון בעיות ניווט
              </p>
            </div>
            <NotificationCenter 
              notifications={mockNotifications} 
              onRefresh={handleRefresh} 
            />
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <MeetingInvitationSender />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="blocked" className="space-y-6">
            <BlockedUsersManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
