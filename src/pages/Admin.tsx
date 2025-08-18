
import React from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
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
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">סקירה</TabsTrigger>
              <TabsTrigger value="users">משתמשים</TabsTrigger>
              <TabsTrigger value="notifications">התראות</TabsTrigger>
              <TabsTrigger value="meetings">פגישות</TabsTrigger>
              <TabsTrigger value="payments">תשלומים</TabsTrigger>
              <TabsTrigger value="blocked">חסומים</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdminStatsGrid />
              <ZeroDiamondUsersNotifier />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdminUserManager />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationCenter />
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
    </AdminGuard>
  );
};

export default Admin;
