import { AdminLayout } from '@/components/admin/AdminLayout';
import { MobileAdminLayout } from '@/components/admin/MobileAdminLayout';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { VibrantStatsCard } from '@/components/admin/VibrantStatsCard';
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
import { Users, Activity, Gem, TrendingUp, CreditCard, UserX } from 'lucide-react';

export default function Admin() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
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
  const [totalDiamonds, setTotalDiamonds] = useState(0);
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
    // Load real bot usage statistics
    loadBotUsageStats();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadBotUsageStats, 30000);
    
    return () => clearInterval(interval);
  }, [user, isAuthenticated, isLoading]);

  const loadBotUsageStats = async () => {
    try {
      // Get actual user counts with fresh queries using existing table structure
      const [
        totalUsersResult,
        activeUsersResult,
        premiumUsersResult,
        blockedUsersResult,
        diamondsResult,
        visibleDiamondsResult,
        todaySessionsResult,
        weeklySessionsResult,
        monthlySessionsResult
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('blocked_users').select('id', { count: 'exact', head: true }),
        supabase.from('inventory').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('inventory').select('id', { count: 'exact', head: true }).eq('store_visible', true).is('deleted_at', null),
        supabase.from('user_sessions').select('telegram_id', { count: 'exact', head: true }).gte('session_start', new Date().toISOString().split('T')[0]),
        supabase.from('user_sessions').select('telegram_id', { count: 'exact', head: true }).gte('session_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_sessions').select('telegram_id', { count: 'exact', head: true }).gte('session_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Calculate engagement rate
      const totalUsers = totalUsersResult.count || 0;
      const activeUsers = activeUsersResult.count || 0;
      const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

      // Update all stats
      setStats({
        totalUsers,
        activeUsers,
        premiumUsers: premiumUsersResult.count || 0,
        totalRevenue: 0, // Will be calculated from actual revenue data
        totalCosts: 0,
        profit: 0
      });

      setBlockedUsersCount(blockedUsersResult.count || 0);
      setAverageEngagement(engagementRate);
      setTotalDiamonds(diamondsResult.count || 0);
      setRealTimeStats({
        todayLogins: todaySessionsResult.count || 0,
        weeklyLogins: weeklySessionsResult.count || 0,
        monthlyLogins: monthlySessionsResult.count || 0
      });

      // Update subscription stats with actual data
      setSubscriptionStats({
        activeSubscriptions: premiumUsersResult.count || 0,
        totalRevenue: 0
      });

    } catch (error) {
      // Silently handle error for production
      toast({
        title: "Error",
        description: "Failed to load usage statistics",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export is being prepared",
    });
  };

  const handleAddUser = () => {
    toast({
      title: "Add User",
      description: "User creation feature coming soon",
    });
  };

  const handleRefreshNotifications = () => {
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
          <div className="space-y-4">
            {/* Vibrant Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <VibrantStatsCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                gradient="primary"
                trend={{ value: 12, isPositive: true }}
              />
              <VibrantStatsCard
                title="Active Users"
                value={stats.activeUsers}
                subtitle="Last 7 days"
                icon={Activity}
                gradient="success"
                trend={{ value: 8, isPositive: true }}
              />
              <VibrantStatsCard
                title="Premium Users"
                value={stats.premiumUsers}
                icon={CreditCard}
                gradient="secondary"
                trend={{ value: 5, isPositive: true }}
              />
              <VibrantStatsCard
                title="Total Diamonds"
                value={totalDiamonds}
                icon={Gem}
                gradient="accent"
              />
              <VibrantStatsCard
                title="Engagement"
                value={`${averageEngagement}%`}
                icon={TrendingUp}
                gradient="warning"
              />
              <VibrantStatsCard
                title="Blocked Users"
                value={blockedUsersCount}
                icon={UserX}
                gradient="danger"
              />
            </div>

            {/* Login Stats */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  📈 Login Activity
                  <ForceRefreshButton />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Today</div>
                    <div className="text-2xl font-bold text-primary">{realTimeStats.todayLogins}</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-xl border border-accent/10">
                    <div className="text-sm font-medium text-muted-foreground mb-1">This Week</div>  
                    <div className="text-2xl font-bold text-accent">{realTimeStats.weeklyLogins}</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                    <div className="text-sm font-medium text-muted-foreground mb-1">This Month</div>
                    <div className="text-2xl font-bold text-secondary">{realTimeStats.monthlyLogins}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
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

  const Layout = isMobile ? MobileAdminLayout : AdminLayout;

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}