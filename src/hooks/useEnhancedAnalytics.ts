
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useEnhancedAnalytics() {
  const [enhancedUsers, setEnhancedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEnhancedUsers = async () => {
    try {
      console.log('Fetching enhanced users data...');
      
      // Fetch user profiles with analytics data
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_analytics (
            total_visits,
            api_calls_count,
            storage_used_mb,
            cost_per_user,
            revenue_per_user,
            profit_loss,
            lifetime_value,
            subscription_status,
            last_active,
            total_time_spent
          )
        `)
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      console.log('Raw profiles data:', profiles);

      // Transform the data to flatten analytics
      const transformedUsers = profiles?.map(profile => ({
        ...profile,
        // Flatten analytics data
        total_visits: profile.user_analytics?.[0]?.total_visits || 0,
        api_calls_count: profile.user_analytics?.[0]?.api_calls_count || 0,
        storage_used_mb: profile.user_analytics?.[0]?.storage_used_mb || 0,
        cost_per_user: profile.user_analytics?.[0]?.cost_per_user || 0,
        revenue_per_user: profile.user_analytics?.[0]?.revenue_per_user || 0,
        profit_loss: profile.user_analytics?.[0]?.profit_loss || 0,
        lifetime_value: profile.user_analytics?.[0]?.lifetime_value || 0,
        subscription_status: profile.user_analytics?.[0]?.subscription_status || profile.subscription_plan || 'free',
        last_active: profile.user_analytics?.[0]?.last_active || profile.updated_at,
        total_time_spent: profile.user_analytics?.[0]?.total_time_spent || '00:00:00'
      })) || [];

      console.log('Transformed users:', transformedUsers);
      setEnhancedUsers(transformedUsers);
    } catch (error: any) {
      console.error('Error fetching enhanced users:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
      setEnhancedUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserEngagementScore = (user: any): number => {
    // Calculate engagement based on visits, API calls, and activity
    const visits = user.total_visits || 0;
    const apiCalls = user.api_calls_count || 0;
    const hasRecentActivity = user.last_active ? 
      (Date.now() - new Date(user.last_active).getTime()) < (7 * 24 * 60 * 60 * 1000) : false;
    
    let score = 0;
    
    // Visits contribution (0-40 points)
    score += Math.min(visits * 2, 40);
    
    // API calls contribution (0-40 points)
    score += Math.min(apiCalls, 40);
    
    // Recent activity bonus (0-20 points)
    if (hasRecentActivity) score += 20;
    
    return Math.min(score, 100);
  };

  const getUserStats = () => {
    const totalUsers = enhancedUsers.length;
    const activeUsers = enhancedUsers.filter(u => {
      const lastActive = u.last_active ? new Date(u.last_active) : null;
      return lastActive && (Date.now() - lastActive.getTime()) < (7 * 24 * 60 * 60 * 1000);
    }).length;
    
    const premiumUsers = enhancedUsers.filter(u => u.is_premium || u.subscription_status === 'premium').length;
    const totalRevenue = enhancedUsers.reduce((sum, u) => sum + (u.revenue_per_user || 0), 0);
    const totalCosts = enhancedUsers.reduce((sum, u) => sum + (u.cost_per_user || 0), 0);

    return {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalRevenue,
      totalCosts,
      profit: totalRevenue - totalCosts
    };
  };

  const refetch = () => {
    setIsLoading(true);
    fetchEnhancedUsers();
  };

  useEffect(() => {
    fetchEnhancedUsers();
  }, []);

  return {
    enhancedUsers,
    isLoading,
    getUserEngagementScore,
    getUserStats,
    refetch
  };
}
