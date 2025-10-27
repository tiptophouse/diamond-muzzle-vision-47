import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface SharePerformanceData {
  stockNumber: string;
  diamondId: string;
  totalShares: number;
  totalViews: number;
  uniqueViewers: number;
  avgViewTime: number;
  lastShared: string;
  shareToViewRatio: number;
  viewsPerShare: number;
}

export function useDiamondSharePerformance() {
  const { user } = useTelegramAuth();
  const [performanceData, setPerformanceData] = useState<SharePerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get all shares by this user
      const { data: shares, error: sharesError } = await supabase
        .from('diamond_shares')
        .select('stock_number, diamond_id, created_at')
        .eq('shared_by', user.id)
        .order('created_at', { ascending: false });

      if (sharesError) throw sharesError;

      if (!shares || shares.length === 0) {
        setPerformanceData([]);
        return;
      }

      // Get analytics for each shared diamond
      const { data: analytics, error: analyticsError } = await supabase
        .from('diamond_share_analytics')
        .select('*')
        .eq('owner_telegram_id', user.id);

      if (analyticsError) throw analyticsError;

      // Group shares by stock number
      const sharesByStock = shares.reduce((acc, share) => {
        if (!acc[share.stock_number]) {
          acc[share.stock_number] = {
            stockNumber: share.stock_number,
            diamondId: share.diamond_id,
            shares: [],
          };
        }
        acc[share.stock_number].shares.push(share);
        return acc;
      }, {} as Record<string, { stockNumber: string; diamondId: string; shares: typeof shares }>);

      // Calculate performance metrics for each diamond
      const performance: SharePerformanceData[] = Object.values(sharesByStock).map(({ stockNumber, diamondId, shares }) => {
        const diamondAnalytics = analytics?.filter(a => a.diamond_stock_number === stockNumber) || [];
        
        const totalViews = diamondAnalytics.length;
        const uniqueViewers = new Set(diamondAnalytics.map(a => a.viewer_telegram_id).filter(id => id)).size;
        
        const viewsWithTime = diamondAnalytics.filter(a => a.time_spent_seconds && a.time_spent_seconds > 0);
        const avgViewTime = viewsWithTime.length > 0
          ? viewsWithTime.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) / viewsWithTime.length
          : 0;

        const totalShares = shares.length;
        const lastShared = shares[0].created_at;
        const viewsPerShare = totalShares > 0 ? totalViews / totalShares : 0;
        const shareToViewRatio = totalViews > 0 ? (totalViews / totalShares) : 0;

        return {
          stockNumber,
          diamondId,
          totalShares,
          totalViews,
          uniqueViewers,
          avgViewTime,
          lastShared,
          shareToViewRatio,
          viewsPerShare,
        };
      });

      // Sort by performance (views per share)
      performance.sort((a, b) => b.viewsPerShare - a.viewsPerShare);

      setPerformanceData(performance);
    } catch (error) {
      console.error('Error fetching share performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPerformance();
    }
  }, [user?.id]);

  return {
    performanceData,
    loading,
    refetch: fetchPerformance,
  };
}
