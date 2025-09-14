
import { useCallback } from 'react';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useForceDataRefresh() {
  const { refetch: refetchUsers } = useEnhancedAnalytics();
  const { toast } = useToast();

  const forceRefreshAllData = useCallback(async () => {
    try {
      console.log('🔄 Force refreshing all admin data...');
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage cache if any
        Object.keys(localStorage).forEach(key => {
          if (key.includes('cache') || key.includes('user_data')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Force refresh user profiles data
      await refetchUsers();

      // Get fresh count from database
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: premiumUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);

      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      console.log('📊 Fresh counts from database:', {
        totalUsers,
        premiumUsers,
        activeSubscriptions
      });

      toast({
        title: "✅ Data Refreshed",
        description: `Updated: ${totalUsers} total users, ${premiumUsers} premium users, ${activeSubscriptions} active subscriptions`,
      });

      // Force page reload to ensure all components refresh
      window.location.reload();

    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      toast({
        title: "❌ Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  }, [refetchUsers, toast]);

  return { forceRefreshAllData };
}
