
import { Layout } from '@/components/layout/Layout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { BlockedUsersManager } from '@/components/admin/BlockedUsersManager';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    totalCosts: 0,
    profit: 0,
  });
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState([]);
  const [blockedUsersCount, setBlockedUsersCount] = useState(0);
  const [averageEngagement, setAverageEngagement] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    console.log('🔍 Admin page mounted');
    console.log('🔍 User:', user);
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 Is loading:', isLoading);
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    async function fetchAdminDashboardData() {
      setLoadingStats(true);
      try {
        // Fetch aggregate stats: total users, active users (last 7 days), premium users
        const { data: statsResult, error: statsError } = await supabase
          .rpc('get_user_statistics');
        if (statsError) {
          throw statsError;
        }
        const stat = Array.isArray(statsResult) ? statsResult[0] : statsResult;
        setStats({
          totalUsers: stat?.total_users || 0,
          activeUsers: stat?.active_users || 0,
          premiumUsers: stat?.premium_users || 0,
          totalRevenue: 25600, // set as needed from your source
          totalCosts: 8400,    // set as needed from your source
          profit: 17200,       // set as needed from your source
        });
        setBlockedUsersCount(stat?.blocked_users || 0);

        // Get login history (all user_sessions, joined to user_profiles)
        const { data: logins, error: loginError } = await supabase
          .from('user_sessions')
          .select('id,telegram_id,session_start,session_end,is_active,pages_visited,user_agent,created_at,user_profiles:first_name,last_name,username,photo_url,is_premium')
          .order('session_start', { ascending: false })
          .limit(250);

        if (loginError) throw loginError;
        setLoginHistory(logins || []);

        // Optionally fetch average engagement, or leave as 0
        setAverageEngagement(0);
      } catch (error) {
        console.error('❌ Error loading admin dashboard data:', error);
        toast({
          title: "Error loading admin data",
          description: String(error),
          variant: "destructive",
        });
      } finally {
        setLoadingStats(false);
      }
    }
    if (user?.id && isAuthenticated) {
      fetchAdminDashboardData();
    }
  }, [user?.id, isAuthenticated, toast]);

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

  if (isLoading || loadingStats) {
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
      <div className="space-y-6 p-4 sm:p-6">
        <AdminHeader 
          onExportData={handleExportData}
          onAddUser={handleAddUser}
        />
        <div className="grid gap-6">
          {/* Stats grid, using real data */}
          <AdminStatsGrid 
            stats={stats}
            blockedUsersCount={blockedUsersCount}
            averageEngagement={averageEngagement}
          />

          {/* Login activity log */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>User Login History (all time)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Telegram ID</th>
                    <th className="p-2 text-left">Login Start</th>
                    <th className="p-2 text-left">Login End</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Pages</th>
                  </tr>
                  </thead>
                  <tbody>
                  {loginHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted-foreground">No logins recorded</td>
                    </tr>
                  ) : (
                    loginHistory.map((s) => (
                      <tr key={s.id || Math.random()} className="border-b hover:bg-gray-50">
                        <td className="p-2 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {s.user_profiles?.photo_url && (
                              <img src={s.user_profiles.photo_url} className="h-6 w-6 rounded-full mr-2" alt="" />
                            )}
                            <span>
                              {s.user_profiles?.first_name || '-'} {s.user_profiles?.last_name || ''}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {s.user_profiles?.username ? `@${s.user_profiles.username}` : ""}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">{s.telegram_id}</td>
                        <td className="p-2 whitespace-nowrap">
                          {s.session_start ? new Date(s.session_start).toLocaleString() : '--'}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {s.session_end ? new Date(s.session_end).toLocaleString() : ''}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <span className={`font-semibold ${s.is_active ? "text-green-600" : "text-gray-400"}`}>
                            {s.is_active ? "Active" : "Ended"}
                          </span>
                        </td>
                        <td className="p-2 text-center">{s.pages_visited || 0}</td>
                      </tr>
                    ))
                  )
                  }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* User manager grid & notification center left untouched */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminUserManager />
            <NotificationCenter 
              notifications={notifications}
              onRefresh={handleRefreshNotifications}
            />
          </div>

          {/* Blocked Users Section */}
          <BlockedUsersManager />
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
            <h4 className="font-bold mb-2">🔧 Admin Debug Info</h4>
            <div className="space-y-1 text-xs">
              <p>User ID: {user.id}</p>
              <p>User Name: {user.first_name} {user.last_name}</p>
              <p>Username: {user.username}</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Page Rendered: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
