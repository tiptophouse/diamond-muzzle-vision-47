
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface AnalyticsData {
  pageVisits: any[];
  userSessions: any[];
  costTracking: any[];
  notifications: any[];
  userProfiles: any[];
  totalUsers: number;
  activeUsers: number;
  totalVisits: number;
  averageSessionTime: number;
  totalCosts: number;
  revenuePerUser: number;
}

export function useAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useTelegramAuth();

  const isAdmin = user?.id === 101;

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        pageVisitsResult,
        userSessionsResult,
        costTrackingResult,
        notificationsResult,
        userProfilesResult,
        userAnalyticsResult
      ] = await Promise.all([
        supabase.from('page_visits').select('*').order('visit_timestamp', { ascending: false }).limit(100),
        supabase.from('user_sessions').select('*').order('session_start', { ascending: false }).limit(50),
        supabase.from('cost_tracking').select('*').order('recorded_at', { ascending: false }).limit(100),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_analytics').select('*')
      ]);

      const totalUsers = userProfilesResult.data?.length || 0;
      const activeUsers = userSessionsResult.data?.filter(session => {
        if (!session.session_start) return false;
        const sessionDate = new Date(session.session_start);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return session.is_active && sessionDate > weekAgo;
      }).length || 0;

      const totalVisits = pageVisitsResult.data?.length || 0;
      
      const avgSessionTime = userSessionsResult.data?.reduce((sum, session) => {
        if (session.total_duration) {
          // Parse interval to minutes - handle interval type properly
          const duration = session.total_duration;
          if (typeof duration === 'string') {
            // Simple parsing for interval format like "00:30:00"
            const parts = duration.split(':');
            if (parts.length >= 2) {
              const minutes = parseInt(parts[1]) || 0;
              return sum + minutes;
            }
          }
          return sum + 30; // Default 30 minutes if parsing fails
        }
        return sum;
      }, 0) / Math.max(userSessionsResult.data?.length || 1, 1);

      const totalCosts = costTrackingResult.data?.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0) || 0;
      
      const revenuePerUser = userAnalyticsResult.data?.reduce((sum, analytics) => sum + (parseFloat(analytics.revenue_per_user) || 0), 0) / Math.max(totalUsers, 1) || 0;

      setAnalytics({
        pageVisits: pageVisitsResult.data || [],
        userSessions: userSessionsResult.data || [],
        costTracking: costTrackingResult.data || [],
        notifications: notificationsResult.data || [],
        userProfiles: userProfilesResult.data || [],
        totalUsers,
        activeUsers,
        totalVisits,
        averageSessionTime: Math.round(avgSessionTime),
        totalCosts,
        revenuePerUser
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    isAdmin
  };
}
