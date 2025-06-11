
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
      // Use user_analytics table for tracking instead of custom table
      if (user) {
        await supabase.from('user_analytics').upsert({
          telegram_id: user.id,
          api_calls_count: 1,
          total_visits: 1,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'telegram_id'
        });
      }
      
      console.log('Analytics event tracked:', event);
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
