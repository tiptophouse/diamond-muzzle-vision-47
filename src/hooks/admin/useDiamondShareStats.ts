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

      // Fetch diamond share analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('diamond_share_analytics')
        .select('viewer_telegram_id, time_spent_seconds, viewed_other_diamonds')
        .gte('view_timestamp', sevenDaysAgo.toISOString());

      if (analyticsError) throw analyticsError;

      // Fetch diamond shares
      const { data: shares, error: sharesError } = await supabase
        .from('diamond_shares')
        .select('id')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (sharesError) throw sharesError;

      // Fetch diamond views
      const { data: views, error: viewsError } = await supabase
        .from('diamond_views')
        .select('viewer_telegram_id, total_view_time, reshared')
        .gte('view_start', sevenDaysAgo.toISOString());

      if (viewsError) throw viewsError;

      const totalViews = analytics?.length || 0;
      const uniqueViewers = new Set(analytics?.map(a => a.viewer_telegram_id).filter(Boolean) || []).size;
      const totalViewTime = analytics?.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) || 0;
      const avgViewTime = totalViews > 0 ? Math.round(totalViewTime / totalViews) : 0;
      const totalShares = shares?.length || 0;
      const reshares = views?.filter(v => v.reshared).length || 0;
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
