
import { Layout } from '@/components/layout/Layout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { NotificationSender } from '@/components/admin/NotificationSender';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Users, Settings, MessageSquare, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);

  // Real bot usage stats
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

  useEffect(() => {
    console.log('🔍 Admin page mounted');
    console.log('🔍 User:', user);
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 Is loading:', isLoading);
    
    // Load real bot usage statistics
    loadBotUsageStats();
  }, [user, isAuthenticated, isLoading]);

  const loadBotUsageStats = async () => {
    try {
      // Get actual user counts
      const { data: totalUsersData } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      const { data: activeUsersData } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: premiumUsersData } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);

      const { data: blockedData } = await supabase
        .from('blocked_users')
        .select('*', { count: 'exact', head: true });

      // Get login statistics
      const { data: todayLoginsData } = await supabase
        .from('user_logins')
        .select('*', { count: 'exact', head: true })
        .gte('login_timestamp', new Date().toISOString().split('T')[0]);

      const { data: weeklyLoginsData } = await supabase
        .from('user_logins')
        .select('*', { count: 'exact', head: true })
        .gte('login_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: monthlyLoginsData } = await supabase
        .from('user_logins')
        .select('*', { count: 'exact', head: true })
        .gte('login_timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalUsers: totalUsersData?.length || 0,
        activeUsers: activeUsersData?.length || 0,
        premiumUsers: premiumUsersData?.length || 0,
        totalRevenue: 0, // TODO: Calculate from subscriptions
        totalCosts: 0,   // TODO: Calculate from cost_tracking
        profit: 0
      });

      setBlockedUsersCount(blockedData?.length || 0);
      setRealTimeStats({
        todayLogins: todayLoginsData?.length || 0,
        weeklyLogins: weeklyLoginsData?.length || 0,
        monthlyLogins: monthlyLoginsData?.length || 0
      });

      console.log('📊 Real bot usage stats:', {
        totalUsers: totalUsersData?.length || 0,
        activeUsers: activeUsersData?.length || 0,
        todayLogins: todayLoginsData?.length || 0,
        weeklyLogins: weeklyLoginsData?.length || 0
      });

    } catch (error) {
      console.error('❌ Error loading bot usage stats:', error);
      toast({
        title: "Error",
        description: "Failed to load real usage statistics",
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
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need to be authenticated to access the admin panel.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Clean Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.first_name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">System Status: Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Bot Usage Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Real-Time Bot Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Today's Logins:</span> {realTimeStats.todayLogins}
            </div>
            <div>
              <span className="font-medium">This Week:</span> {realTimeStats.weeklyLogins}
            </div>
            <div>
              <span className="font-medium">This Month:</span> {realTimeStats.monthlyLogins}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">User Management</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="users" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <AdminUserManager />
              </div>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <PaymentManagement />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-0">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <NotificationSender onSendNotification={(notification) => console.log('Sent notification:', notification)} />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <NotificationCenter notifications={notifications} onRefresh={handleRefreshNotifications} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-0">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                <p className="text-gray-600">Admin settings panel coming soon...</p>
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
              <p>Page Rendered: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
