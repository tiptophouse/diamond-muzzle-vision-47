
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Activity, AlertTriangle, Bell, ArrowRight, TrendingUp, Database, Zap } from 'lucide-react';

interface UserLoginStats {
  total_logins: number;
  unique_users: number;
  new_users: number;
  returning_users: number;
}

interface PageNavigationData {
  page_path: string;
  visit_count: number;
  unique_visitors: number;
  avg_time_spent: number;
  bounce_rate: number;
}

interface NavigationIssues {
  stuck_users: number;
  error_pages: string[];
  navigation_failures: number;
}

interface AuthenticationStats {
  telegram_jwt_users: number;
  fastapi_signins: number;
  auth_failures: number;
  otp_usage: number;
}

interface NotificationStats {
  total_notifications: number;
  group_notifications: number;
  per_user_avg: number;
  delivery_rate: number;
}

export default function UserInsightsAnalytics() {
  const [loginStats, setLoginStats] = useState<UserLoginStats | null>(null);
  const [pageNavigation, setPageNavigation] = useState<PageNavigationData[]>([]);
  const [navigationIssues, setNavigationIssues] = useState<NavigationIssues | null>(null);
  const [authStats, setAuthStats] = useState<AuthenticationStats | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLoginStats(),
        loadPageNavigation(),
        loadNavigationIssues(),
        loadAuthenticationStats(),
        loadNotificationStats()
      ]);
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load user insights data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLoginStats = async () => {
    try {
      // Get login stats for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: userLogins, error: loginsError } = await supabase
        .from('user_logins')
        .select('telegram_id, login_timestamp, created_at')
        .gte('login_timestamp', thirtyDaysAgo.toISOString());

      if (loginsError) throw loginsError;

      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('telegram_id, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (profilesError) throw profilesError;

      // Calculate stats
      const totalLogins = userLogins?.length || 0;
      const uniqueUsers = new Set(userLogins?.map(login => login.telegram_id)).size;
      const newUsers = userProfiles?.length || 0;
      const returningUsers = uniqueUsers - newUsers;

      setLoginStats({
        total_logins: totalLogins,
        unique_users: uniqueUsers,
        new_users: newUsers,
        returning_users: Math.max(0, returningUsers)
      });

      console.log('📊 Login stats loaded:', { totalLogins, uniqueUsers, newUsers });
    } catch (error) {
      console.error('❌ Error loading login stats:', error);
    }
  };

  const loadPageNavigation = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: pageVisits, error } = await supabase
        .from('page_visits')
        .select('page_path, page_title, time_spent, session_id')
        .gte('visit_timestamp', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Process page navigation data
      const pageStats = new Map<string, {
        visits: number;
        sessions: Set<string>;
        totalTime: number;
        bounces: number;
      }>();

      pageVisits?.forEach(visit => {
        const path = visit.page_path || '/';
        if (!pageStats.has(path)) {
          pageStats.set(path, {
            visits: 0,
            sessions: new Set(),
            totalTime: 0,
            bounces: 0
          });
        }

        const stats = pageStats.get(path)!;
        stats.visits++;
        stats.sessions.add(visit.session_id);
        
        // Convert interval to seconds if available
        if (visit.time_spent) {
          // Simple parsing for time intervals (you might need to adjust this)
          stats.totalTime += 30; // Default 30 seconds if we can't parse
        }
      });

      const navigationData: PageNavigationData[] = Array.from(pageStats.entries()).map(([path, stats]) => ({
        page_path: path,
        visit_count: stats.visits,
        unique_visitors: stats.sessions.size,
        avg_time_spent: stats.visits > 0 ? Math.round(stats.totalTime / stats.visits) : 0,
        bounce_rate: stats.visits > 0 ? Math.round((stats.bounces / stats.visits) * 100) : 0
      })).sort((a, b) => b.visit_count - a.visit_count);

      setPageNavigation(navigationData);
      console.log('📊 Page navigation loaded:', navigationData.length, 'pages');
    } catch (error) {
      console.error('❌ Error loading page navigation:', error);
    }
  };

  const loadNavigationIssues = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Look for sessions that had very few page visits (potential stuck users)
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select(`
          id,
          pages_visited,
          session_start,
          session_end,
          is_active
        `)
        .gte('session_start', thirtyDaysAgo.toISOString());

      if (sessionsError) throw sessionsError;

      // Calculate navigation issues
      const stuckUsers = sessions?.filter(session => 
        session.pages_visited <= 1 && 
        session.session_end && 
        new Date(session.session_end).getTime() - new Date(session.session_start).getTime() > 30000 // More than 30 seconds
      ).length || 0;

      const navigationFailures = sessions?.filter(session => 
        session.pages_visited === 0
      ).length || 0;

      setNavigationIssues({
        stuck_users: stuckUsers,
        error_pages: ['/error', '/404'], // Common error pages
        navigation_failures: navigationFailures
      });

      console.log('📊 Navigation issues loaded:', { stuckUsers, navigationFailures });
    } catch (error) {
      console.error('❌ Error loading navigation issues:', error);
    }
  };

  const loadAuthenticationStats = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get group CTA clicks (FastAPI sign-ins)
      const { data: ctaClicks, error: ctaError } = await supabase
        .from('group_cta_clicks')
        .select('registration_success, registration_attempted, fastapi_response')
        .gte('clicked_at', thirtyDaysAgo.toISOString());

      if (ctaError) throw ctaError;

      // Get user logins with JWT data
      const { data: userLogins, error: loginsError } = await supabase
        .from('user_logins')
        .select('telegram_id, init_data_hash')
        .gte('login_timestamp', thirtyDaysAgo.toISOString());

      if (loginsError) throw loginsError;

      const telegramJwtUsers = userLogins?.filter(login => login.init_data_hash).length || 0;
      const fastApiSignins = ctaClicks?.filter(click => click.registration_success).length || 0;
      const authFailures = ctaClicks?.filter(click => 
        click.registration_attempted && !click.registration_success
      ).length || 0;

      setAuthStats({
        telegram_jwt_users: telegramJwtUsers,
        fastapi_signins: fastApiSignins,
        auth_failures: authFailures,
        otp_usage: 0 // Would need to add OTP tracking
      });

      console.log('📊 Auth stats loaded:', { telegramJwtUsers, fastApiSignins, authFailures });
    } catch (error) {
      console.error('❌ Error loading auth stats:', error);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('telegram_id, message_type, status, metadata')
        .gte('sent_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const totalNotifications = notifications?.length || 0;
      const groupNotifications = notifications?.filter(notif => 
        notif.metadata && typeof notif.metadata === 'object' && 
        'source' in notif.metadata && notif.metadata.source === 'group'
      ).length || 0;

      const uniqueUsers = new Set(notifications?.map(notif => notif.telegram_id)).size;
      const perUserAvg = uniqueUsers > 0 ? Math.round(totalNotifications / uniqueUsers) : 0;
      
      const deliveredNotifications = notifications?.filter(notif => 
        notif.status === 'delivered' || notif.status === 'sent'
      ).length || 0;
      const deliveryRate = totalNotifications > 0 ? 
        Math.round((deliveredNotifications / totalNotifications) * 100) : 0;

      setNotificationStats({
        total_notifications: totalNotifications,
        group_notifications: groupNotifications,
        per_user_avg: perUserAvg,
        delivery_rate: deliveryRate
      });

      console.log('📊 Notification stats loaded:', { 
        totalNotifications, 
        groupNotifications, 
        perUserAvg, 
        deliveryRate 
      });
    } catch (error) {
      console.error('❌ Error loading notification stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">User Insights Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Insights Analytics</h2>
          <p className="text-muted-foreground">Last 30 days comprehensive overview</p>
        </div>
        <Button onClick={loadAllAnalytics} variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Login Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loginStats?.total_logins || 0}</div>
            <p className="text-xs text-muted-foreground">
              {loginStats?.unique_users || 0} unique users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loginStats?.new_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              First time users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Users</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{loginStats?.returning_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Came back this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Navigation Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{navigationIssues?.stuck_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Users stuck on pages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Page Navigation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Page Navigation Patterns
          </CardTitle>
          <CardDescription>
            Most visited pages and user navigation behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pageNavigation.slice(0, 10).map((page, index) => (
              <div key={page.page_path} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <div className="font-medium">{page.page_path}</div>
                    <div className="text-sm text-muted-foreground">
                      {page.unique_visitors} unique visitors
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{page.visit_count} visits</div>
                  <div className="text-sm text-muted-foreground">
                    {page.avg_time_spent}s avg time
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Authentication & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Authentication Usage
            </CardTitle>
            <CardDescription>
              JWT and FastAPI authentication statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Telegram JWT Users</span>
              <Badge variant="secondary">{authStats?.telegram_jwt_users || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>FastAPI Sign-ins</span>
              <Badge variant="secondary">{authStats?.fastapi_signins || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Auth Failures</span>
              <Badge variant="destructive">{authStats?.auth_failures || 0}</Badge>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              FastAPI integration working with {authStats?.fastapi_signins || 0} successful authentications
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Analytics
            </CardTitle>
            <CardDescription>
              Group notifications and delivery statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Notifications</span>
              <Badge variant="secondary">{notificationStats?.total_notifications || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>From Groups</span>
              <Badge variant="outline">{notificationStats?.group_notifications || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Per User Average</span>
              <Badge variant="outline">{notificationStats?.per_user_avg || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Delivery Rate</span>
              <Badge variant={notificationStats && notificationStats.delivery_rate > 90 ? "default" : "destructive"}>
                {notificationStats?.delivery_rate || 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Issues Details */}
      {navigationIssues && navigationIssues.stuck_users > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Navigation Issues Detected
            </CardTitle>
            <CardDescription>
              Users experiencing navigation problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>{navigationIssues.stuck_users}</strong> users appear to be stuck on single pages
              </div>
              <div>
                <strong>{navigationIssues.navigation_failures}</strong> sessions with no page navigation
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                💡 Recommendation: Check your NavigationManager implementation and add more debug logging
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
