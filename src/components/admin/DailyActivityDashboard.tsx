
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  MousePointer, 
  Clock, 
  Activity, 
  Eye, 
  Upload,
  RefreshCw,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface DailyStats {
  activeUsersToday: number;
  totalPageViews: number;
  totalClicks: number;
  averageSessionTime: string;
  topPages: Array<{ page: string; views: number }>;
  recentActivity: Array<{
    user: string;
    action: string;
    time: string;
    page: string;
  }>;
  hourlyActivity: Array<{ hour: number; users: number }>;
}

export function DailyActivityDashboard() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchTodaysActivity = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Fetching today\'s activity data...');
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's user sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          user_profiles!inner(first_name, last_name)
        `)
        .gte('session_start', `${today}T00:00:00Z`)
        .lte('session_start', `${today}T23:59:59Z`);

      if (sessionsError) throw sessionsError;

      // Get today's page visits
      const { data: pageVisits, error: pageVisitsError } = await supabase
        .from('page_visits')
        .select('*')
        .gte('visit_timestamp', `${today}T00:00:00Z`)
        .lte('visit_timestamp', `${today}T23:59:59Z`);

      if (pageVisitsError) throw pageVisitsError;

      // Get today's analytics events (clicks)
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', `${today}T00:00:00Z`)
        .lte('timestamp', `${today}T23:59:59Z`)
        .eq('event_type', 'click');

      if (eventsError) throw eventsError;

      // Process the data
      const activeUsersToday = new Set(sessions?.map(s => s.telegram_id)).size;
      const totalPageViews = pageVisits?.length || 0;
      const totalClicks = events?.length || 0;

      // Calculate average session time
      const sessionTimes = sessions?.filter(s => s.total_duration).map(s => {
        const duration = s.total_duration;
        if (typeof duration === 'string') {
          const parts = duration.split(':');
          return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        return 0;
      }) || [];
      
      const avgSeconds = sessionTimes.length > 0 
        ? sessionTimes.reduce((sum, time) => sum + time, 0) / sessionTimes.length 
        : 0;
      
      const hours = Math.floor(avgSeconds / 3600);
      const minutes = Math.floor((avgSeconds % 3600) / 60);
      const averageSessionTime = `${hours}ש ${minutes}ד`;

      // Top pages
      const pageMap = new Map<string, number>();
      pageVisits?.forEach(visit => {
        pageMap.set(visit.page_path, (pageMap.get(visit.page_path) || 0) + 1);
      });
      
      const topPages = Array.from(pageMap.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Recent activity
      const recentActivity = sessions?.slice(0, 10).map(session => ({
        user: session.user_profiles?.first_name || `משתמש ${session.telegram_id}`,
        action: 'כניסה למערכת',
        time: new Date(session.session_start).toLocaleTimeString('he-IL'),
        page: session.entry_page || '/'
      })) || [];

      // Hourly activity
      const hourlyMap = new Map<number, Set<number>>();
      sessions?.forEach(session => {
        const hour = new Date(session.session_start).getHours();
        if (!hourlyMap.has(hour)) {
          hourlyMap.set(hour, new Set());
        }
        hourlyMap.get(hour)?.add(session.telegram_id);
      });

      const hourlyActivity = Array.from(hourlyMap.entries())
        .map(([hour, userSet]) => ({ hour, users: userSet.size }))
        .sort((a, b) => a.hour - b.hour);

      setStats({
        activeUsersToday,
        totalPageViews,
        totalClicks,
        averageSessionTime,
        topPages,
        recentActivity,
        hourlyActivity
      });

      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('❌ Error fetching daily activity:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני הפעילות היומית",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysActivity();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchTodaysActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <p className="text-muted-foreground">טוען נתוני פעילות יומית...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">מה קורה היום</h2>
          <p className="text-gray-600">סקירת פעילות יומית ומעקב משתמשים</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            עדכון אחרון: {lastRefresh.toLocaleTimeString('he-IL')}
          </div>
          <Button 
            onClick={fetchTodaysActivity} 
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            רענן
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">משתמשים פעילים היום</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.activeUsersToday || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">צפיות בעמודים</p>
                <p className="text-3xl font-bold text-green-600">{stats?.totalPageViews || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">לחיצות</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.totalClicks || 0}</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">זמן ממוצע בסשן</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.averageSessionTime || '0ש 0ד'}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              עמודים פופולאריים היום
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{page.page}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {page.views} צפיות
                  </div>
                </div>
              ))}
              {(!stats?.topPages || stats.topPages.length === 0) && (
                <p className="text-gray-500 text-center py-4">אין נתונים זמינים</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              פעילות אחרונה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats?.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.page}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {activity.time}
                  </div>
                </div>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <p className="text-gray-500 text-center py-4">אין פעילות היום</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            פעילות לפי שעות היום
          </CardTitle>
          <CardDescription>
            מספר משתמשים פעילים בכל שעה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 gap-2">
            {Array.from({ length: 24 }, (_, i) => {
              const hourData = stats?.hourlyActivity.find(h => h.hour === i);
              const users = hourData?.users || 0;
              const maxUsers = Math.max(...(stats?.hourlyActivity.map(h => h.users) || [1]));
              const height = maxUsers > 0 ? (users / maxUsers) * 100 : 0;
              
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-6 bg-blue-500 rounded-t"
                    style={{ height: `${height}%`, minHeight: users > 0 ? '8px' : '2px' }}
                    title={`שעה ${i}:00 - ${users} משתמשים`}
                  ></div>
                  <div className="text-xs text-gray-600">{i}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
