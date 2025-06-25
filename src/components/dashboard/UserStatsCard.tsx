
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Clock, Eye, MousePointer, TrendingUp } from 'lucide-react';

export function UserStatsCard() {
  const { user } = useTelegramAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUserStats = async () => {
      try {
        const { data: behaviorData } = await supabase
          .from('user_behavior_analytics')
          .select('*')
          .eq('telegram_id', user.id)
          .single();

        const { data: sessionsData } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('telegram_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const currentSession = sessionsData?.[0];

        setStats({
          totalSessions: behaviorData?.total_sessions || 0,
          totalPageViews: behaviorData?.total_page_views || 0,
          totalTimeSpent: behaviorData?.total_time_spent || '0 seconds',
          diamondsAdded: behaviorData?.diamonds_added || 0,
          diamondsEdited: behaviorData?.diamonds_edited || 0,
          diamondsDeleted: behaviorData?.diamonds_deleted || 0,
          engagementScore: behaviorData?.engagement_score || 0,
          currentDeviceType: currentSession?.device_type || 'unknown',
          lastVisit: behaviorData?.last_visit
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Activity Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600">Page Views</div>
              <div className="font-semibold">{stats.totalPageViews}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-gray-600">Sessions</div>
              <div className="font-semibold">{stats.totalSessions}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MousePointer className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm text-gray-600">Diamonds Added</div>
              <div className="font-semibold">{stats.diamondsAdded}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-sm text-gray-600">Engagement</div>
              <div className="font-semibold">{stats.engagementScore}</div>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="text-xs text-gray-500">
            Device: {stats.currentDeviceType} • 
            Total operations: {stats.diamondsAdded + stats.diamondsEdited + stats.diamondsDeleted}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
