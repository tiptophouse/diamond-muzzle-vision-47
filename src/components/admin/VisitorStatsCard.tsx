
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, UserCheck, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VisitorStats {
  totalVisitors: number;
  authenticatedUsers: number;
  todayVisitors: number;
  avgSessionDuration: string;
}

export function VisitorStatsCard() {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    authenticatedUsers: 0,
    todayVisitors: 0,
    avgSessionDuration: '0m'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVisitorStats();
  }, []);

  const fetchVisitorStats = async () => {
    try {
      // Get total unique visitors from page_visits
      const { data: totalVisits } = await supabase
        .from('page_visits')
        .select('id', { count: 'exact' });

      // Get authenticated users count
      const { data: authUsers } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' });

      // Get today's visitors
      const today = new Date().toISOString().split('T')[0];
      const { data: todayVisits } = await supabase
        .from('page_visits')
        .select('id', { count: 'exact' })
        .gte('visit_timestamp', today);

      // Get average session duration from user_sessions
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('total_duration')
        .not('total_duration', 'is', null);

      let avgDuration = '0m';
      if (sessions && sessions.length > 0) {
        // Convert intervals to minutes and calculate average
        const totalMinutes = sessions.reduce((sum, session) => {
          if (session.total_duration) {
            // Parse interval format (e.g., "00:05:30" -> 5.5 minutes)
            const parts = session.total_duration.toString().split(':');
            const minutes = parseInt(parts[1]) + (parseInt(parts[2]) / 60);
            return sum + minutes;
          }
          return sum;
        }, 0);
        
        const avgMinutes = Math.round(totalMinutes / sessions.length);
        avgDuration = `${avgMinutes}m`;
      }

      setStats({
        totalVisitors: totalVisits?.length || 0,
        authenticatedUsers: authUsers?.length || 0,
        todayVisitors: todayVisits?.length || 0,
        avgSessionDuration: avgDuration
      });

    } catch (error) {
      console.error('Error fetching visitor stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visitor Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Visitor Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-lg font-bold">{stats.totalVisitors}</div>
              <div className="text-xs text-muted-foreground">Total Visitors</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-lg font-bold">{stats.authenticatedUsers}</div>
              <div className="text-xs text-muted-foreground">Registered Users</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-lg font-bold">{stats.todayVisitors}</div>
              <div className="text-xs text-muted-foreground">Today's Visits</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-lg font-bold">{stats.avgSessionDuration}</div>
              <div className="text-xs text-muted-foreground">Avg Session</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Conversion Rate:</strong> {stats.totalVisitors > 0 
              ? Math.round((stats.authenticatedUsers / stats.totalVisitors) * 100) 
              : 0}% of visitors become registered users
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
