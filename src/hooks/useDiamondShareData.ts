import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from './useTelegramAuth';

interface ShareAnalytics {
  id: string;
  diamond_stock_number: string;
  viewer_telegram_id: number | null;
  time_spent_seconds: number | null;
  device_type: string | null;
  returned_visitor: boolean;
  viewed_other_diamonds: boolean;
  view_timestamp: string;
}

export function useDiamondShareData() {
  const { user } = useTelegramAuth();
  const [shareAnalytics, setShareAnalytics] = useState<ShareAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShareAnalytics = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('diamond_share_analytics')
        .select('*')
        .eq('owner_telegram_id', user.id)
        .order('view_timestamp', { ascending: false });

      if (error) throw error;
      setShareAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching share analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchShareAnalytics();
    }
  }, [user?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('share-analytics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diamond_share_analytics',
          filter: `owner_telegram_id=eq.${user.id}`
        },
        () => {
          fetchShareAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    shareAnalytics,
    loading,
    refetch: fetchShareAnalytics
  };
}
