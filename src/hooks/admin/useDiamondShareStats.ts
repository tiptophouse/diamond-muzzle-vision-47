import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ShareStats {
  totalViews: number;
  uniqueViewers: number;
  avgViewTime: number;
  totalShares: number;
  clickRate: number;
  reshares: number;
}

export function useDiamondShareStats() {
  const [shareStats, setShareStats] = useState<ShareStats>({
    totalViews: 0,
    uniqueViewers: 0,
    avgViewTime: 0,
    totalShares: 0,
    clickRate: 0,
    reshares: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShareStats();
  }, []);

  const fetchShareStats = async () => {
    try {
      setIsLoading(true);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Try multiple data sources to get analytics
      
      // 1. Check store_item_analytics (preferred)
      const { data: storeAnalytics } = await supabase
        .from('store_item_analytics')
        .select('user_telegram_id, view_duration_seconds, event_type')
        .gte('created_at', sevenDaysAgo.toISOString());

      // 2. Check store_item_shares
      const { data: storeShares } = await supabase
        .from('store_item_shares')
        .select('id, owner_telegram_id')
        .gte('created_at', sevenDaysAgo.toISOString());

      // 3. Check user_analytics for active users
      const { data: userAnalytics } = await supabase
        .from('user_analytics')
        .select('telegram_id, total_visits, total_time_spent')
        .gte('last_active', sevenDaysAgo.toISOString());

      // 4. Fallback: check diamond_share_analytics
      const { data: diamondAnalytics } = await supabase
        .from('diamond_share_analytics')
        .select('viewer_telegram_id, time_spent_seconds')
        .gte('view_timestamp', sevenDaysAgo.toISOString());

      // Calculate stats from available data
      const allViews = [
        ...(storeAnalytics || []).map(a => ({ 
          viewer: a.user_telegram_id, 
          time: a.view_duration_seconds || 0 
        })),
        ...(diamondAnalytics || []).map(a => ({ 
          viewer: a.viewer_telegram_id, 
          time: a.time_spent_seconds || 0 
        }))
      ];

      const totalViews = allViews.length;
      const uniqueViewers = new Set(allViews.map(v => v.viewer).filter(Boolean)).size;
      const totalViewTime = allViews.reduce((sum, v) => sum + v.time, 0);
      const avgViewTime = totalViews > 0 ? Math.round(totalViewTime / totalViews) : 0;
      
      const totalShares = (storeShares?.length || 0);
      const reshares = storeShares?.filter(s => s.owner_telegram_id).length || 0;
      const clickRate = totalShares > 0 ? Math.round((totalViews / totalShares) * 100) : 0;

      setShareStats({
        totalViews,
        uniqueViewers,
        avgViewTime,
        totalShares,
        clickRate,
        reshares
      });
    } catch (error) {
      console.error('Error fetching share stats:', error);
      // Keep zero stats on error
    } finally {
      setIsLoading(false);
    }
  };

  return {
    shareStats,
    isLoading,
    refetch: fetchShareStats
  };
}
