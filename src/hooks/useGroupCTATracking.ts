import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from './useTelegramAuth';

export function useGroupCTATracking() {
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  const trackCTAClick = async (startParameter: string, sourceGroupId?: number) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('group_cta_clicks')
        .insert({
          telegram_id: user.id,
          start_parameter: startParameter,
          source_group_id: sourceGroupId,
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error tracking CTA click:', error);
        return false;
      }

      console.log('✅ CTA click tracked successfully');
      return true;
    } catch (err) {
      console.error('Error tracking CTA click:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCTAAnalytics = async (daysBack = 7) => {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysBack);

      const { data, error } = await supabase
        .from('group_cta_clicks')
        .select('*')
        .gte('clicked_at', fromDate.toISOString())
        .order('clicked_at', { ascending: false });

      if (error) throw error;

      return {
        totalClicks: data?.length || 0,
        clicksByDay: data?.reduce((acc: any, click) => {
          const day = new Date(click.clicked_at).toDateString();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {}),
        uniqueUsers: [...new Set(data?.map(click => click.telegram_id))].length,
        data: data || []
      };
    } catch (err) {
      console.error('Error fetching CTA analytics:', err);
      return null;
    }
  };

  // Auto-track if user comes from group_activation or dashboard_direct
  useEffect(() => {
    if (!user?.id) return;

    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('start');
    
    if (startParam === 'group_activation' || startParam === 'dashboard_direct') {
      trackCTAClick(startParam);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user?.id]);

  return {
    trackCTAClick,
    getCTAAnalytics,
    isLoading
  };
}