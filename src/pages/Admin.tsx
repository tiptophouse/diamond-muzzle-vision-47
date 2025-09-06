
import { AdminHeader } from '@/components/admin/AdminHeader';
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
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Users, Settings, MessageSquare, CreditCard, Upload, BarChart3, Diamond, Send, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const { toast } = useToast();
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

  return (
    <div>
      {/* Clean Admin Header with Force Refresh */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back, {user.first_name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ForceRefreshButton />
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">System Status: Online</span>
              <span className="text-xs text-green-600 sm:hidden">●</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Real-Time Stats */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">📊 Real-Time Bot Usage</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-600">Total Users</div>
              <div className="text-blue-700 font-bold text-lg">{stats.totalUsers}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-600">Premium</div>
              <div className="text-green-700 font-bold text-lg">{stats.premiumUsers}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-600">Subscriptions</div>
              <div className="text-purple-700 font-bold text-lg">{subscriptionStats.activeSubscriptions}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-600">Revenue</div>
              <div className="text-emerald-700 font-bold text-lg">${subscriptionStats.totalRevenue.toFixed(0)}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mt-3">
            <div className="text-center">
              <div className="font-medium text-gray-600">Today</div>
              <div className="font-bold">{realTimeStats.todayLogins}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-600">Week</div>
              <div className="font-bold">{realTimeStats.weeklyLogins}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-600">Month</div>
              <div className="font-bold">{realTimeStats.monthlyLogins}</div>
            </div>
          </div>
        </div>
        
        <AdminStatsGrid
          stats={stats}
          blockedUsersCount={blockedUsersCount}
          averageEngagement={averageEngagement}
        />
      </div>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-8">
        <Tabs defaultValue="analytics" className="space-y-4">
          <div className="relative">
            <TabsList className="w-full h-auto p-1 bg-muted rounded-lg overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 min-w-max">
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <BarChart3 className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Bot</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="blocked-users" 
                  className="flex items-center gap-1 data-[state=active]:bg-red-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <Shield className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Blocked</span>
                  <span className="sm:hidden">Block</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="diamond-counts" 
                  className="flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <Diamond className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Diamonds</span>
                  <span className="sm:hidden">💎</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="upload-analysis" 
                  className="flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <BarChart3 className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Analysis</span>
                  <span className="sm:hidden">📊</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Users</span>
                  <span className="sm:hidden">👥</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sessions" 
                  className="flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Sessions</span>
                  <span className="sm:hidden">📱</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <CreditCard className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Payments</span>
                  <span className="sm:hidden">💳</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="group-cta" 
                  className="flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <Send className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Group CTA</span>
                  <span className="sm:hidden">📢</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <MessageSquare className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Messages</span>
                  <span className="sm:hidden">💬</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="bulk-share" 
                  className="flex items-center gap-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <Diamond className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Bulk Share</span>
                  <span className="sm:hidden">🔄</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="acadia-message" 
                  className="flex items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <MessageSquare className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Acadia Msg</span>
                  <span className="sm:hidden">🏢</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-2 text-xs font-medium whitespace-nowrap min-w-fit"
                >
                  <Settings className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">⚙️</span>
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
          
          <div className="mt-4">
            <TabsContent value="analytics" className="space-y-4">
              <AdminStatsGrid
                stats={stats}
                blockedUsersCount={blockedUsersCount}
                averageEngagement={averageEngagement}
              />
              <RealTimeBotAnalytics />
              <DiamondShareAnalytics />
              <GroupCTAAnalytics />
            </TabsContent>
            
            <TabsContent value="blocked-users" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-6">
                  <BlockedUsersManager />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="diamond-counts" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <OptimizedUserDiamondCounts />
              </div>
            </TabsContent>
            
            <TabsContent value="upload-analysis" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <UserUploadAnalysis />
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-0">
              <AdminUserManager />
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <SessionUsersDisplay />
              </div>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                <PaymentManagement />
              </div>
            </TabsContent>

            <TabsContent value="group-cta" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                <CTATrackingFix />
                <div className="mt-6 sm:mt-8">
                  <GroupCTASender />
                </div>
                <div className="mt-4 sm:mt-6">
                  <GroupCTAAnalytics />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-0">
              <div className="grid gap-4 sm:gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                  <SFTPTestMessageSender />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                  <SFTPGroupMessageSender />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                  <IndividualMessageSender />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                  <SFTPPromotionSender />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                  <UploadReminderNotifier />
                </div>
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                    <NotificationSender onSendNotification={(notification) => console.log('Sent notification:', notification)} />
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                    <NotificationCenter notifications={notifications} onRefresh={handleRefreshNotifications} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bulk-share" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                <BulkDiamondShare />
              </div>
            </TabsContent>

            <TabsContent value="acadia-message" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                <AcadiaBulkMessageSender />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">System Settings</h3>
                <p className="text-gray-600 text-sm sm:text-base">Admin settings panel coming soon...</p>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 text-sm">
            <h4 className="font-bold mb-2 text-xs sm:text-sm">🔧 Admin Debug Info</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p>User ID: {user.id}</p>
              <p>User Name: {user.first_name} {user.last_name}</p>
              <p>Username: {user.username}</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Total Users in DB: {stats.totalUsers}</p>
              <p>Premium Users: {stats.premiumUsers}</p>
              <p>Active Subscriptions: {subscriptionStats.activeSubscriptions}</p>
              <p>Page Rendered: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
