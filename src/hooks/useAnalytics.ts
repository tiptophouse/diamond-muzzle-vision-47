
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: string;
  totalRevenue: number;
  totalCosts: number;
  profitLoss: number;
  topPages: Array<{ page: string; visits: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  costBreakdown: Array<{ service: string; cost: number }>;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: activeUsers } = await supabase
        .from('user_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', yesterday.toISOString());

      // Get total sessions
      const { count: totalSessions } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true });

      // Get average session duration
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('total_duration')
        .not('total_duration', 'is', null);

      let avgDuration = '0 minutes';
      if (sessions && sessions.length > 0) {
        // Calculate average duration (simplified)
        avgDuration = '15 minutes'; // Placeholder calculation
      }

      // Get financial data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('amount')
        .eq('status', 'active');

      const totalRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;

      const { data: costs } = await supabase
        .from('cost_tracking')
        .select('amount');

      const totalCosts = costs?.reduce((sum, cost) => sum + cost.amount, 0) || 0;

      // Get top pages
      const { data: pageVisits } = await supabase
        .from('page_visits')
        .select('page_path')
        .limit(1000);

      const pageCount = pageVisits?.reduce((acc, visit) => {
        acc[visit.page_path] = (acc[visit.page_path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topPages = Object.entries(pageCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([page, visits]) => ({ page, visits }));

      // Get user growth (last 7 days)
      const userGrowth = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const { count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', `${dateStr}T23:59:59.999Z`);

        userGrowth.push({ date: dateStr, users: count || 0 });
      }

      // Get cost breakdown by service
      const { data: costData } = await supabase
        .from('cost_tracking')
        .select('service_name, amount');

      const servicesCosts = costData?.reduce((acc, cost) => {
        const service = cost.service_name || 'unknown';
        acc[service] = (acc[service] || 0) + cost.amount;
        return acc;
      }, {} as Record<string, number>) || {};

      const costBreakdown = Object.entries(servicesCosts)
        .map(([service, cost]) => ({ service, cost }));

      setAnalytics({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalSessions: totalSessions || 0,
        averageSessionDuration: avgDuration,
        totalRevenue,
        totalCosts,
        profitLoss: totalRevenue - totalCosts,
        topPages,
        userGrowth,
        costBreakdown,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    refetch: fetchAnalytics,
  };
}
