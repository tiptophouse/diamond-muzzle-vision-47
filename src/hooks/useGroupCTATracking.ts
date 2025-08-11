
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from './useTelegramAuth';
import { toast } from '@/components/ui/use-toast';

export function useGroupCTATracking() {
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  const trackCTAClick = async (startParameter: string, sourceGroupId?: number) => {
    if (!user?.id) {
      console.warn('⚠️ Cannot track CTA click - no user ID available');
      return false;
    }
    
    setIsLoading(true);
    try {
      console.log('📊 Tracking CTA click:', { 
        telegram_id: user.id, 
        startParameter, 
        sourceGroupId 
      });

      const { data, error } = await supabase
        .from('group_cta_clicks')
        .insert({
          telegram_id: user.id,
          start_parameter: startParameter,
          source_group_id: sourceGroupId,
          user_agent: navigator.userAgent
        })
        .select();

      if (error) {
        console.error('❌ Error tracking CTA click:', error);
        toast({
          title: "❌ Tracking Failed",
          description: `Failed to track CTA click: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ CTA click tracked successfully:', data);
      toast({
        title: "✅ Click Tracked",
        description: "Group CTA interaction recorded successfully",
        duration: 2000,
      });
      return true;
    } catch (err) {
      console.error('❌ Error tracking CTA click:', err);
      toast({
        title: "❌ Tracking Error", 
        description: "Failed to record group interaction",
        variant: "destructive",
      });
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

      if (error) {
        console.error('❌ Error fetching CTA analytics:', error);
        throw error;
      }

      console.log('📊 CTA Analytics fetched:', data);

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
      console.error('❌ Error fetching CTA analytics:', err);
      return null;
    }
  };

  // Auto-track if user comes from group_activation
  useEffect(() => {
    if (!user?.id) {
      console.log('🔍 No user ID available for auto-tracking');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('start');
    
    console.log('🔍 Checking URL params:', { startParam, url: window.location.href });
    
    if (startParam === 'group_activation') {
      console.log('🎯 Group activation detected, tracking CTA click...');
      trackCTAClick('group_activation');
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
