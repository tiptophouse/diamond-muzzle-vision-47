import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalViews: number;
  uniqueViewers: number;
  mobileViews: number;
  avgTimeSpent: number;
  returnVisitors: number;
  viewedOthers: number;
}

interface ViewTrackingData {
  viewerTelegramId?: number;
  viewerIpAddress?: string;
  userAgent?: string;
  deviceType?: string;
  referrer?: string;
}

export function useDiamondShareAnalytics(stockNumber: string) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const { toast } = useToast();

  const trackDiamondView = async (data: ViewTrackingData) => {
    if (!stockNumber) return;

    try {
      // Get the diamond owner from inventory
      const { data: inventory } = await supabase
        .from('inventory')
        .select('user_id')
        .eq('stock_number', stockNumber)
        .single();

      if (!inventory) return;

      // Check if this is a returning visitor
      const { data: existingViews } = await supabase
        .from('diamond_share_analytics')
        .select('id')
        .eq('diamond_stock_number', stockNumber)
        .eq('viewer_telegram_id', data.viewerTelegramId || 0)
        .limit(1);

      const isReturning = existingViews && existingViews.length > 0;

      // Insert analytics record
      await supabase.from('diamond_share_analytics').insert({
        diamond_stock_number: stockNumber,
        owner_telegram_id: inventory.user_id,
        viewer_telegram_id: data.viewerTelegramId,
        viewer_ip_address: null, // We don't track IP for privacy
        viewer_user_agent: data.userAgent,
        device_type: data.deviceType,
        referrer: data.referrer,
        session_id: sessionId,
        returned_visitor: isReturning
      });

    } catch (error) {
      console.error('Error tracking diamond view:', error);
    }
  };

  const trackTimeSpent = async (timeSpentSeconds: number, viewedOthers: boolean) => {
    if (!stockNumber || timeSpentSeconds < 1) return;

    try {
      await supabase
        .from('diamond_share_analytics')
        .update({
          time_spent_seconds: timeSpentSeconds,
          viewed_other_diamonds: viewedOthers
        })
        .eq('session_id', sessionId)
        .eq('diamond_stock_number', stockNumber);
    } catch (error) {
      console.error('Error tracking time spent:', error);
    }
  };

  const trackOtherDiamondsViewed = async () => {
    if (!stockNumber) return;

    try {
      await supabase
        .from('diamond_share_analytics')
        .update({ viewed_other_diamonds: true })
        .eq('session_id', sessionId)
        .eq('diamond_stock_number', stockNumber);
    } catch (error) {
      console.error('Error tracking other diamonds viewed:', error);
    }
  };

  const getAnalytics = async () => {
    if (!stockNumber) return;

    try {
      const { data, error } = await supabase
        .from('diamond_share_analytics')
        .select('*')
        .eq('diamond_stock_number', stockNumber);

      if (error) throw error;

      if (data && data.length > 0) {
        const totalViews = data.length;
        const uniqueViewers = new Set(data.map(v => v.viewer_telegram_id)).size;
        const mobileViews = Math.round((data.filter(v => v.device_type === 'mobile').length / totalViews) * 100);
        const validTimeSpent = data.filter(v => v.time_spent_seconds && v.time_spent_seconds > 0);
        const avgTimeSpent = validTimeSpent.length > 0 
          ? Math.round(validTimeSpent.reduce((sum, v) => sum + (v.time_spent_seconds || 0), 0) / validTimeSpent.length)
          : 0;
        const returnVisitors = data.filter(v => v.returned_visitor).length;
        const viewedOthers = data.filter(v => v.viewed_other_diamonds).length;

        setAnalytics({
          totalViews,
          uniqueViewers,
          mobileViews,
          avgTimeSpent,
          returnVisitors,
          viewedOthers
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Load analytics on mount
  useEffect(() => {
    if (stockNumber) {
      getAnalytics();
    }
  }, [stockNumber]);

  return {
    trackDiamondView,
    trackTimeSpent,
    trackOtherDiamondsViewed,
    getAnalytics,
    analytics
  };
}