import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { NotificationSender } from '@/components/admin/NotificationSender';
import { UploadReminderNotifier } from '@/components/admin/UploadReminderNotifier';
import { GroupCTASender } from '@/components/admin/GroupCTASender';
import { GroupCTAAnalytics } from '@/components/admin/GroupCTAAnalytics';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { SessionUsersDisplay } from '@/components/admin/SessionUsersDisplay';
import { UserUploadAnalysis } from '@/components/admin/UserUploadAnalysis';
import { OptimizedUserDiamondCounts } from '@/components/admin/OptimizedUserDiamondCounts';
import { ForceRefreshButton } from '@/components/admin/ForceRefreshButton';
import { AuthDiagnostics } from '@/components/debug/AuthDiagnostics';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { IndividualMessageSender } from '@/components/admin/IndividualMessageSender';
import { SFTPPromotionSender } from '@/components/admin/SFTPPromotionSender';
import { SFTPGroupMessageSender } from '@/components/admin/SFTPGroupMessageSender';
import { SFTPTestMessageSender } from '@/components/admin/SFTPTestMessageSender';
import { DiamondShareAnalytics } from "@/components/admin/DiamondShareAnalytics";
import { RealTimeBotAnalytics } from "@/components/admin/RealTimeBotAnalytics";
import { BlockedUsersManager } from '@/components/admin/BlockedUsersManager';
import { CTATrackingFix } from '@/components/admin/CTATrackingFix';
import { BulkDiamondShare } from '@/components/admin/BulkDiamondShare';
import { AcadiaBulkMessageSender } from '@/components/admin/AcadiaBulkMessageSender';
import { ReEngagementCampaign } from '@/components/admin/ReEngagementCampaign';
import { UserEngagementTracker } from '@/components/admin/UserEngagementTracker';
import { GamificationManager } from '@/components/admin/GamificationManager';
import { BotWebhookTester } from '@/components/admin/BotWebhookTester';
import { WebhookDiagnostics } from '@/components/admin/WebhookDiagnostics';
import { CampaignManager } from '@/components/admin/CampaignManager';
import { RealTimeMonitor } from '@/components/admin/RealTimeMonitor';
import { useSearchParams } from 'react-router-dom';

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'monitor';
  const [notifications, setNotifications] = useState([]);

  // Real bot usage stats - Updated to refresh more frequently
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0, 
    premiumUsers: 0,
    totalRevenue: 0,
    totalCosts: 0,
    profit: 0
  });
  const [blockedUsersCount, setBlockedUsersCount] = useState(0);
  const [averageEngagement, setAverageEngagement] = useState(0);
  const [realTimeStats, setRealTimeStats] = useState({
    todayLogins: 0,
    weeklyLogins: 0,
    monthlyLogins: 0
  });
  const [subscriptionStats, setSubscriptionStats] = useState({
    activeSubscriptions: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    console.log('🔍 Admin page mounted');
    console.log('🔍 User:', user);
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 Is loading:', isLoading);
    
    // Load real bot usage statistics
    loadBotUsageStats();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadBotUsageStats, 30000);
    
    return () => clearInterval(interval);
  }, [user, isAuthenticated, isLoading]);

  const loadBotUsageStats = async () => {
    try {
      console.log('📊 Loading fresh stats from database...');
      
      // Get actual user counts with fresh queries
      const { data: totalUsersData, count: totalUsersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      const { data: activeUsersData, count: activeUsersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: premiumUsersData, count: premiumUsersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('is_premium', true);

      const { data: subscriptionsData, count: subscriptionsCount } = await supabase
        .from('subscriptions')
        .select('amount', { count: 'exact' })
        .eq('status', 'active');

      const { data: blockedData, count: blockedCount } = await supabase
        .from('blocked_users')
        .select('*', { count: 'exact' });

      // Calculate total revenue from active subscriptions
      const totalRevenue = subscriptionsData?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;

      // Get login statistics
      const { count: todayLoginsCount } = await supabase
        .from('user_logins')
        .select('*', { count: 'exact', head: true })
        .gte('login_timestamp', new Date().toISOString().split('T')[0]);

      const { count: weeklyLoginsCount } = await supabase
        .from('user_logins')
        .select('*', { count: 'exact', head: true })
        .gte('login_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: monthlyLoginsCount } = await supabase
        .from('user_logins')
        .select('*', { count: 'exact', head: true })
        .gte('login_timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Update all stats
      setStats({
        totalUsers: totalUsersCount || 0,
        activeUsers: activeUsersCount || 0,
        premiumUsers: premiumUsersCount || 0,
        totalRevenue,
        totalCosts: 0,
        profit: totalRevenue
      });

      setSubscriptionStats({
        activeSubscriptions: subscriptionsCount || 0,
        totalRevenue
      });

      setBlockedUsersCount(blockedCount || 0);
      setRealTimeStats({
        todayLogins: todayLoginsCount || 0,
        weeklyLogins: weeklyLoginsCount || 0,
        monthlyLogins: monthlyLoginsCount || 0
      });

      console.log('📊 Updated stats:', {
        totalUsers: totalUsersCount || 0,
        activeUsers: activeUsersCount || 0,
        premiumUsers: premiumUsersCount || 0,
        activeSubscriptions: subscriptionsCount || 0,
        totalRevenue,
        todayLogins: todayLoginsCount || 0,
        weeklyLogins: weeklyLoginsCount || 0
      });

    } catch (error) {
      console.error('❌ Error loading bot usage stats:', error);
      toast({
        title: "Error",
        description: "Failed to load usage statistics",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    console.log('Exporting data...');
    toast({
      title: "Export Started",
      description: "Your data export is being prepared",
    });
  };

  const handleAddUser = () => {
    console.log('Adding new user...');
    toast({
      title: "Add User",
      description: "User creation feature coming soon",
    });
  };

  const handleRefreshNotifications = () => {
    console.log('Refreshing notifications...');
    toast({
      title: "Notifications Refreshed",
      description: "Notification data has been updated",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be authenticated to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'monitor':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Real-Time Bot Usage
                  <ForceRefreshButton />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
                    <div className="text-sm font-medium text-gray-600">Total Users</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.totalUsers}</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border">
                    <div className="text-sm font-medium text-gray-600">Premium Users</div>
                    <div className="text-2xl font-bold text-green-700">{stats.premiumUsers}</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border">
                    <div className="text-sm font-medium text-gray-600">Active Subscriptions</div>
                    <div className="text-2xl font-bold text-purple-700">{subscriptionStats.activeSubscriptions}</div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border">
                    <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                    <div className="text-2xl font-bold text-emerald-700">${subscriptionStats.totalRevenue.toFixed(0)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Today</div>
                    <div className="text-xl font-bold">{realTimeStats.todayLogins}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">This Week</div>  
                    <div className="text-xl font-bold">{realTimeStats.weeklyLogins}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">This Month</div>
                    <div className="text-xl font-bold">{realTimeStats.monthlyLogins}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <AdminStatsGrid
              stats={stats}
              blockedUsersCount={blockedUsersCount}  
              averageEngagement={averageEngagement}
            />
            <RealTimeMonitor />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">  
            <RealTimeBotAnalytics />
            <DiamondShareAnalytics />
          </div>
        );
      case 'users':
        return <AdminUserManager />;
      case 'blocked-users':
        return <BlockedUsersManager />;
      case 'sessions':
        return <SessionUsersDisplay />;
      case 'diamond-counts':
        return <OptimizedUserDiamondCounts />;
      case 'upload-analysis':
        return <UserUploadAnalysis />;
      case 'campaigns':
        return <CampaignManager />;
      case 'notifications':
        return (
          <NotificationCenter 
            notifications={notifications}
            onRefresh={handleRefreshNotifications}
          />
        );
      case 'bulk-share':
        return <BulkDiamondShare />;
      case 'group-cta':
        return (
          <div className="space-y-6">
            <GroupCTASender />
            <GroupCTAAnalytics />
            <CTATrackingFix />
          </div>
        );
      case 'payments':
        return <PaymentManagement />;
      case 'diagnostics':
        return <AuthDiagnostics />;
      case 'webhook-test':
        return (
          <div className="space-y-6">
            <BotWebhookTester />
            <WebhookDiagnostics />
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Section Not Found</h3>
            <p className="text-gray-600">The requested admin section could not be found.</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
}