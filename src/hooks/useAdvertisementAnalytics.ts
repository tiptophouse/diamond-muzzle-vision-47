
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface AnalyticsEvent {
  event_type: 'page_view' | 'click' | 'conversion' | 'form_submit' | 'section_view';
  event_data?: Record<string, any>;
  page_path?: string;
}

export function useAdvertisementAnalytics() {
  const { user } = useTelegramAuth();
  const [sessionId] = useState(() => crypto.randomUUID());

  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      await supabase.from('advertisement_analytics').insert({
        page_path: event.page_path || window.location.pathname,
        session_id: sessionId,
        telegram_id: user?.id || null,
        event_type: event.event_type,
        event_data: event.event_data || {},
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign')
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  };

  const trackPageView = (path?: string) => {
    trackEvent({
      event_type: 'page_view',
      page_path: path || window.location.pathname,
      event_data: {
        timestamp: new Date().toISOString(),
        user_id: user?.id || null
      }
    });
  };

  const trackClick = (element: string, data?: Record<string, any>) => {
    trackEvent({
      event_type: 'click',
      event_data: {
        element,
        ...data
      }
    });
  };

  const trackConversion = (action: string, data?: Record<string, any>) => {
    trackEvent({
      event_type: 'conversion',
      event_data: {
        action,
        ...data
      }
    });
  };

  const trackSectionView = (section: string) => {
    trackEvent({
      event_type: 'section_view',
      event_data: {
        section,
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackClick,
    trackConversion,
    trackSectionView,
    sessionId
  };
}
