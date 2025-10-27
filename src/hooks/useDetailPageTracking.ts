import { useEffect, useRef, useCallback, useState } from 'react';
import { analyticsQueue } from '@/utils/analyticsQueue';
import { useTelegramAuth } from './useTelegramAuth';

interface DetailPageTrackingOptions {
  stockNumber: string;
  sessionId: string;
  cameFrom: 'catalog' | 'share_link' | 'direct' | 'search';
  catalogPosition?: number;
}

export function useDetailPageTracking({ 
  stockNumber, 
  sessionId, 
  cameFrom,
  catalogPosition 
}: DetailPageTrackingOptions) {
  const { user } = useTelegramAuth();
  const [viewId, setViewId] = useState<string | null>(null);
  const entryTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef(0);
  const updateTimer = useRef<NodeJS.Timeout | null>(null);

  const [interactions, setInteractions] = useState({
    viewed_certificate: false,
    viewed_360: false,
    clicked_contact: false,
    clicked_share: false
  });

  const calculateScrollDepth = useCallback(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercentage = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );
    maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercentage);
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => calculateScrollDepth();
    window.addEventListener('scroll', handleScroll);
    calculateScrollDepth(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [calculateScrollDepth]);

  // Create initial record
  useEffect(() => {
    const id = crypto.randomUUID();
    setViewId(id);

    analyticsQueue.track('diamond_detail_views', {
      id,
      diamond_stock_number: stockNumber,
      user_telegram_id: user?.id || null,
      session_id: sessionId,
      came_from: cameFrom,
      catalog_position: catalogPosition || null,
      time_spent_seconds: 0,
      viewed_certificate: false,
      viewed_360: false,
      clicked_contact: false,
      clicked_share: false,
      scroll_depth_percentage: 0,
      timestamp: new Date().toISOString()
    });
  }, [stockNumber, user?.id, sessionId, cameFrom, catalogPosition]);

  // Auto-update every 10 seconds
  useEffect(() => {
    const updateView = () => {
      if (!viewId) return;

      const timeSpent = Math.round((Date.now() - entryTime.current) / 1000);

      // Update via Supabase directly (not queued, for real-time data)
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase
          .from('diamond_detail_views')
          .update({
            time_spent_seconds: timeSpent,
            scroll_depth_percentage: maxScrollDepth.current,
            ...interactions
          })
          .eq('id', viewId)
          .then();
      });
    };

    updateTimer.current = setInterval(updateView, 10000); // Every 10 seconds

    return () => {
      if (updateTimer.current) {
        clearInterval(updateTimer.current);
      }
      updateView(); // Final update on unmount
    };
  }, [viewId, interactions]);

  // Track interactions
  const trackInteraction = useCallback((interaction: keyof typeof interactions) => {
    setInteractions(prev => ({
      ...prev,
      [interaction]: true
    }));
  }, []);

  return {
    trackCertificateView: () => trackInteraction('viewed_certificate'),
    track360View: () => trackInteraction('viewed_360'),
    trackContactClick: () => trackInteraction('clicked_contact'),
    trackShareClick: () => trackInteraction('clicked_share')
  };
}
