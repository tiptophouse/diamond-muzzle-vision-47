
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { AdminUserManager } from "@/components/admin/AdminUserManager";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { BlockedUsersManager } from "@/components/admin/BlockedUsersManager";
import { DailyActivityDashboard } from "@/components/admin/DailyActivityDashboard";
import { GroupDiscussionAnalytics } from "@/components/admin/GroupDiscussionAnalytics";
import { DiamondShareAnalytics } from "@/components/admin/DiamondShareAnalytics";
import { UserUploadAnalysis } from "@/components/admin/UserUploadAnalysis";
import { PersonalizedOutreachSystem } from "@/components/admin/PersonalizedOutreachSystem";
import { PaymentManagement } from "@/components/admin/PaymentManagement";
import { EngagementDashboard } from "@/components/engagement/EngagementDashboard";
import { SmartNotificationSystem } from "@/components/engagement/SmartNotificationSystem";
import { DeepLinkReports } from "@/components/engagement/DeepLinkReports";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Users, TrendingUp, DollarSign, Database } from 'lucide-react';

export default function Admin() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    totalCosts: 0,
    profit: 0,
  });

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_statistics');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const userStats = data[0];
        setStats({
          totalUsers: userStats.total_users || 0,
          activeUsers: userStats.active_users || 0,
          premiumUsers: userStats.premium_users || 0,
          totalRevenue: 0,
          totalCosts: 0,
          profit: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!user) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">You must be logged in to access the admin panel.</p>
          </div>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="container mx-auto p-4">
        <AdminHeader />
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AdminStatsGrid stats={stats} />
            <DailyActivityDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <AdminUserManager />
            <BlockedUsersManager />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationCenter />
            <SmartNotificationSystem />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <GroupDiscussionAnalytics />
            <DiamondShareAnalytics />
            <UserUploadAnalysis />
            <DeepLinkReports />
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <EngagementDashboard />
            <PersonalizedOutreachSystem />
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <PaymentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </TelegramLayout>
  );
}
