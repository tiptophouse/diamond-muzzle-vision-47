import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AccurateStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  blockedUsers: number;
  usersWithPhone: number;
  recentSignups: number;
  totalSessions: number;
  totalPageViews: number;
  todayViews: number;
  avgSessionDuration: number;
}

interface UserActivity {
  telegram_id: number;
  first_name: string;
  last_name: string;
  username: string;
  total_sessions: number;
  total_page_views: number;
  total_time_spent: string;
  last_active: string;
  engagement_score: number;
  message_leader_rank?: number;
}

interface GroupInteraction {
  total_notifications: number;
  group_diamond_requests: number;
  total_messages_sent: number;
  active_group_members: number;
  top_message_leaders: UserActivity[];
}

export function useAccurateAnalytics() {
  const [stats, setStats] = useState<AccurateStats | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [groupInteractions, setGroupInteractions] = useState<GroupInteraction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccurateStats = async () => {
    try {
      console.log('📊 Fetching accurate user statistics...');
      
      // Use the database function to get accurate stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_statistics');

      if (statsError) {
        console.error('Error fetching user stats:', statsError);
        throw statsError;
      }

      // Get session analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_realistic_analytics_summary');

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError);
        throw analyticsError;
      }

      const userStats = statsData?.[0] || {} as any;
      const sessionStats = analyticsData?.[0] || {} as any;

      setStats({
        totalUsers: userStats.total_users || 0,
        activeUsers: userStats.active_users || 0,
        premiumUsers: userStats.premium_users || 0,
        blockedUsers: userStats.blocked_users || 0,
        usersWithPhone: userStats.users_with_phone || 0,
        recentSignups: userStats.recent_signups || 0,
        totalSessions: Number(sessionStats.total_sessions) || 0,
        totalPageViews: Number(sessionStats.total_page_views) || 0,
        todayViews: Number(sessionStats.today_views) || 0,
        avgSessionDuration: Number(sessionStats.avg_session_duration_seconds) || 0
      });

      console.log('Accurate stats:', userStats, sessionStats);
    } catch (error) {
      console.error('Error fetching accurate stats:', error);
      toast({
        title: "Error",
        description: "Failed to load accurate statistics",
        variant: "destructive",
      });
    }
  };

  const fetchUserActivities = async () => {
    try {
      console.log('👥 Fetching detailed user activities...');
      
      // Get comprehensive user behavior data
      const { data: behaviorData, error: behaviorError } = await supabase
        .from('user_behavior_analytics')
        .select(`
          telegram_id,
          total_sessions,
          total_page_views,
          total_time_spent,
          last_visit,
          engagement_score
        `)
        .order('engagement_score', { ascending: false });

      if (behaviorError) {
        console.error('Error fetching behavior data:', behaviorError);
        throw behaviorError;
      }

      // Get user profile details
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, last_login');

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        throw profileError;
      }

      // Merge the data
      const activities: UserActivity[] = behaviorData?.map(behavior => {
        const profile = profileData?.find(p => p.telegram_id === behavior.telegram_id);
        return {
          telegram_id: behavior.telegram_id,
          first_name: profile?.first_name || 'Unknown',
          last_name: profile?.last_name || '',
          username: profile?.username || '',
          total_sessions: behavior.total_sessions || 0,
          total_page_views: behavior.total_page_views || 0,
          total_time_spent: String(behavior.total_time_spent || '00:00:00'),
          last_active: behavior.last_visit || profile?.last_login || '',
          engagement_score: behavior.engagement_score || 0
        };
      }) || [];

      setUserActivities(activities);
      console.log('User activities:', activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      toast({
        title: "Error",
        description: "Failed to load user activities",
        variant: "destructive",
      });
    }
  };

  const fetchGroupInteractions = async () => {
    try {
      console.log('💬 Fetching group interaction data...');
      
      // Get notification data
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .select('message_type, telegram_id, created_at')
        .order('created_at', { ascending: false });

      if (notificationError) {
        console.error('Error fetching notifications:', notificationError);
        throw notificationError;
      }

      // Calculate group interactions
      const totalNotifications = notificationData?.length || 0;
      const groupDiamondRequests = notificationData?.filter(n => 
        n.message_type === 'group_diamond_request'
      ).length || 0;

      // Count messages per user for leadership
      const messageCountByUser = new Map<number, number>();
      notificationData?.forEach(notification => {
        const current = messageCountByUser.get(notification.telegram_id) || 0;
        messageCountByUser.set(notification.telegram_id, current + 1);
      });

      // Get top message leaders
      const topMessageLeaders = userActivities
        .map(user => ({
          ...user,
          message_count: messageCountByUser.get(user.telegram_id) || 0
        }))
        .sort((a, b) => b.message_count - a.message_count)
        .slice(0, 10);

      const totalMessagesSent = Array.from(messageCountByUser.values())
        .reduce((sum, count) => sum + count, 0);

      const activeGroupMembers = messageCountByUser.size;

      setGroupInteractions({
        total_notifications: totalNotifications,
        group_diamond_requests: groupDiamondRequests,
        total_messages_sent: totalMessagesSent,
        active_group_members: activeGroupMembers,
        top_message_leaders: topMessageLeaders
      });

      console.log('Group interactions:', {
        totalNotifications,
        groupDiamondRequests,
        totalMessagesSent,
        activeGroupMembers
      });
    } catch (error) {
      console.error('Error fetching group interactions:', error);
      toast({
        title: "Error",
        description: "Failed to load group interaction data",
        variant: "destructive",
      });
    }
  };

  const refetchAll = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchAccurateStats(),
      fetchUserActivities(),
    ]);
    // Fetch group interactions after user activities to use the data
    await fetchGroupInteractions();
    setIsLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await refetchAll();
    };
    loadData();
  }, []);

  return {
    stats,
    userActivities,
    groupInteractions,
    isLoading,
    refetch: refetchAll
  };
}