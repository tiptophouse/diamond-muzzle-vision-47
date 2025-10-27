import { useEffect, useRef, useCallback } from 'react';
import { analyticsQueue } from '@/utils/analyticsQueue';
import { useTelegramAuth } from './useTelegramAuth';

interface TrackingOptions {
  stockNumber: string;
  catalogPosition?: number;
  sessionId: string;
}

export function useStoreItemTracking({ stockNumber, catalogPosition, sessionId }: TrackingOptions) {
  const { user } = useTelegramAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const viewStartTime = useRef<number | null>(null);
  const hasTrackedImpression = useRef(false);
  const intersectionRatio = useRef(0);

  const getDeviceType = useCallback(() => {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) return 'mobile';
    return 'desktop';
  }, []);

  const trackEvent = useCallback((eventType: string, viewDuration = 0) => {
    analyticsQueue.track('store_item_analytics', {
      diamond_stock_number: stockNumber,
      user_telegram_id: user?.id || null,
      session_id: sessionId,
      event_type: eventType,
      view_duration_seconds: viewDuration,
      viewport_percentage: Math.round(intersectionRatio.current * 100),
      scroll_position: window.scrollY,
      device_type: getDeviceType(),
      timestamp: new Date().toISOString()
    });
  }, [stockNumber, user?.id, sessionId, getDeviceType]);

  const startViewTimer = useCallback(() => {
    if (!viewStartTime.current) {
      viewStartTime.current = Date.now();
      
      if (!hasTrackedImpression.current && intersectionRatio.current >= 0.5) {
        trackEvent('impression');
        hasTrackedImpression.current = true;
      }
    }
  }, [trackEvent]);

  const endViewTimer = useCallback(() => {
    if (viewStartTime.current) {
      const duration = Math.round((Date.now() - viewStartTime.current) / 1000);
      if (duration >= 1) { // Only track if viewed for at least 1 second
        trackEvent('impression', duration);
      }
      viewStartTime.current = null;
    }
  }, [trackEvent]);

  // Intersection Observer for viewport tracking
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          intersectionRatio.current = entry.intersectionRatio;
          
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            startViewTimer();
          } else {
            endViewTimer();
          }
        });
      },
      { threshold: [0, 0.5, 1.0] }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
      endViewTimer();
    };
  }, [startViewTimer, endViewTimer]);

  // Track clicks
  const trackClick = useCallback((clickType: 'view_details_click' | 'contact_click' | 'share_click' | 'image_click') => {
    const viewDuration = viewStartTime.current 
      ? Math.round((Date.now() - viewStartTime.current) / 1000)
      : 0;
    trackEvent(clickType, viewDuration);
  }, [trackEvent]);

  return {
    cardRef,
    trackClick
  };
}
