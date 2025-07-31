
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { WelcomeMessageSender } from '@/components/admin/WelcomeMessageSender';
import { BulkAnnouncementSender } from '@/components/admin/BulkAnnouncementSender';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { BlockedUsersManager } from '@/components/admin/BlockedUsersManager';
import { supabase } from '@/integrations/supabase/client';
import { Users, Bell, MessageSquare, CreditCard, Ban, Megaphone } from 'lucide-react';

interface NotificationData {
  id: string;
  telegram_id: number;
  message_type: string;
  message_content: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  metadata?: any;
  created_at: string;
  user_first_name?: string;
  user_last_name?: string;
}

export default function Admin() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          user_profiles!notifications_telegram_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        user_first_name: item.user_profiles?.first_name,
        user_last_name: item.user_profiles?.last_name
      })) || [];

      setNotifications(formattedData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <AdminGuard>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, notifications, and system settings
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            Admin Panel
          </Badge>
        </div>

        <AdminStatsGrid />

        <Tabs defaultValue="announcements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              הודעות
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="welcome" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Welcome
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Blocked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
            <BulkAnnouncementSender />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserTable />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter 
              notifications={notifications} 
              onRefresh={fetchNotifications}
            />
          </TabsContent>

          <TabsContent value="welcome">
            <WelcomeMessageSender />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="blocked">
            <BlockedUsersManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
