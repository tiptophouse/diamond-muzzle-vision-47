
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
      
      // Use raw SQL query to insert into advertisement_analytics table
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          INSERT INTO advertisement_analytics (
            page_path, session_id, telegram_id, event_type, event_data, 
            user_agent, referrer, utm_source, utm_medium, utm_campaign
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        params: [
          event.page_path || window.location.pathname,
          sessionId,
          user?.id || null,
          event.event_type,
          JSON.stringify(event.event_data || {}),
          navigator.userAgent,
          document.referrer || null,
          urlParams.get('utm_source'),
          urlParams.get('utm_medium'),
          urlParams.get('utm_campaign')
        ]
      });

      if (error) {
        console.error('Error tracking analytics event:', error);
      }
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
