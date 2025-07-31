
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useEnhancedAnalytics() {
  const [enhancedUsers, setEnhancedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEnhancedUsers = async () => {
    try {
      console.log('🔍 Fetching enhanced users data...');
      
      // First, fetch all user profiles
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('❌ Error fetching profiles:', profileError);
        throw profileError;
      }

      console.log('✅ Fetched user profiles:', profiles?.length || 0);

      // Then fetch analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*');

      if (analyticsError) {
        console.warn('⚠️ Error fetching analytics (continuing without):', analyticsError);
      }

      console.log('✅ Fetched analytics data:', analytics?.length || 0);

      // Combine profiles with analytics
      const transformedUsers = profiles?.map(profile => {
        const userAnalytics = analytics?.find(a => a.telegram_id === profile.telegram_id);
        
        return {
          ...profile,
          // Analytics data
          total_visits: userAnalytics?.total_visits || 0,
          api_calls_count: userAnalytics?.api_calls_count || 0,
          storage_used_mb: userAnalytics?.storage_used_mb || 0,
          cost_per_user: userAnalytics?.cost_per_user || 0,
          revenue_per_user: userAnalytics?.revenue_per_user || 0,
          profit_loss: userAnalytics?.profit_loss || 0,
          lifetime_value: userAnalytics?.lifetime_value || 0,
          subscription_status: userAnalytics?.subscription_status || profile.subscription_plan || 'free',
          last_active: userAnalytics?.last_active || profile.updated_at,
          total_time_spent: userAnalytics?.total_time_spent || '00:00:00'
        };
      }) || [];

      console.log('✅ Enhanced users created:', transformedUsers.length);
      setEnhancedUsers(transformedUsers);

      if (transformedUsers.length === 0) {
        console.warn('⚠️ No users found in database');
        toast({
          title: "⚠️ No Users Found",
          description: "The user database appears to be empty. Check your database connection.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Admin data loaded successfully:', {
          totalUsers: transformedUsers.length,
          premiumUsers: transformedUsers.filter(u => u.is_premium).length,
          recentUsers: transformedUsers.filter(u => {
            const created = new Date(u.created_at);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return created > weekAgo;
          }).length
        });
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching enhanced users:', error);
      toast({
        title: "❌ Database Error",
        description: `Failed to load user data: ${error.message}`,
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
    console.log('🔄 Refetching admin data...');
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
