
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
import { UserDiamondCounts } from '@/components/admin/UserDiamondCounts';
import { ForceRefreshButton } from '@/components/admin/ForceRefreshButton';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Users, Settings, MessageSquare, CreditCard, Upload, BarChart3, Diamond, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { IndividualMessageSender } from '@/components/admin/IndividualMessageSender';

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
    <div className="telegram-mini-app">
      {/* Mobile-First Admin Header */}
      <div className="bg-background border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Admin</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user.first_name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-2">
              <ForceRefreshButton />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground hidden sm:inline">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Real-Time Stats */}
      <div className="px-4 py-4">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-primary mb-3 text-sm">📊 Real-Time Stats</h3>
          
          {/* Key Metrics Grid - 2x2 on mobile */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-bold text-primary">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{stats.premiumUsers}</div>
              <div className="text-xs text-muted-foreground">Premium</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{subscriptionStats.activeSubscriptions}</div>
              <div className="text-xs text-muted-foreground">Active Subs</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-bold text-emerald-600">${subscriptionStats.totalRevenue.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
          </div>
          
          {/* Login Stats - Horizontal layout */}
          <div className="flex justify-between text-xs bg-background/30 rounded-lg p-2">
            <div className="text-center">
              <div className="font-semibold">{realTimeStats.todayLogins}</div>
              <div className="text-muted-foreground">Today</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{realTimeStats.weeklyLogins}</div>
              <div className="text-muted-foreground">Week</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{realTimeStats.monthlyLogins}</div>
              <div className="text-muted-foreground">Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Admin Tabs */}
      <div className="px-4 pb-6">
        <Tabs defaultValue="users" className="space-y-4">
          {/* Horizontal Scrollable Tab List for Mobile */}
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max bg-muted/30 p-1 rounded-lg">
              <TabsTrigger 
                value="diamond-counts" 
                className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Diamond className="h-3 w-3" />
                <span>Diamonds</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload-analysis" 
                className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart3 className="h-3 w-3" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="h-3 w-3" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sessions" 
                className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="h-3 w-3" />
                <span>Sessions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CreditCard className="h-3 w-3" />
                <span>Payments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="group-cta" 
                className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Send className="h-3 w-3" />
                <span>CTA</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Messages</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings className="h-3 w-3" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content - Mobile Optimized */}
          <div className="mt-4">
            <TabsContent value="diamond-counts" className="space-y-0 m-0">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <UserDiamondCounts />
              </div>
            </TabsContent>
            
            <TabsContent value="upload-analysis" className="space-y-0 m-0">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <UserUploadAnalysis />
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-0 m-0">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <AdminUserManager />
              </div>
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-0 m-0">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <SessionUsersDisplay />
              </div>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-0 m-0">
              <div className="bg-card rounded-xl border border-border p-4">
                <PaymentManagement />
              </div>
            </TabsContent>

            <TabsContent value="group-cta" className="space-y-0 m-0">
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                <GroupCTASender />
                <GroupCTAAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-0 m-0">
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <UploadReminderNotifier />
                </div>
                <div className="space-y-4">
                  <div className="bg-card rounded-xl border border-border p-4">
                    <NotificationSender onSendNotification={(notification) => console.log('Sent notification:', notification)} />
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <NotificationCenter notifications={notifications} onRefresh={handleRefreshNotifications} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-0 m-0">
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                <p className="text-muted-foreground">Admin settings panel coming soon...</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
            <h4 className="font-bold mb-2">🔧 Admin Debug Info</h4>
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
