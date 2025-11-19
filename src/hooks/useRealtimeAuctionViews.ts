import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeAuctionViews(auctionId: string) {
  const [viewCount, setViewCount] = useState(0);
  const [uniqueViewers, setUniqueViewers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auctionId) return;

    // Fetch initial counts
    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('auction_analytics')
          .select('*')
          .eq('auction_id', auctionId)
          .eq('event_type', 'view');

        if (error) throw error;

        setViewCount(data?.length || 0);
        setUniqueViewers(new Set(data?.map(d => d.telegram_id).filter(Boolean)).size);
      } catch (error) {
        console.error('Failed to fetch view counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`auction-views-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_analytics',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          console.log('🔴 New auction view:', payload);
          setViewCount(prev => prev + 1);
          // Refetch to get accurate unique viewers count
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  return { viewCount, uniqueViewers, isLoading };
}
