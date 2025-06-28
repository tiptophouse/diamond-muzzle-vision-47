
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface PageVisit {
  page_path: string;
  page_title: string;
  visit_timestamp: string;
  referrer?: string;
  time_spent?: number;
  session_id?: string;
}

export function useEnhancedUserTracking() {
  const { user } = useTelegramAuth();
  const [sessionId, setSessionId] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(new Date());

  // Generate session ID
  useEffect(() => {
    const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Track page visit using existing user_sessions table
  const trackEnhancedPageVisit = useCallback(async (pagePath: string, pageTitle: string) => {
    if (!user?.id || !sessionId) return;

    try {
      await supabase
        .from('user_sessions')
        .insert({
          telegram_id: user.id,
          session_start: new Date().toISOString(),
          entry_page: pagePath,
          is_active: true,
          device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          browser_info: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          referrer_url: document.referrer || 'direct'
        });

      console.log('Page visit tracked:', pagePath);
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  }, [user?.id, sessionId]);

  // Track feature usage using existing user_activity_log table
  const trackFeatureUsage = useCallback(async (featureName: string, contextData?: any) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_activity_log')
        .insert({
          telegram_id: user.id,
          activity_type: 'feature_usage',
          activity_data: {
            feature_name: featureName,
            ...contextData
          },
          timestamp: new Date().toISOString(),
          session_id: sessionId
        });

      console.log('Feature usage tracked:', featureName);
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }, [user?.id, sessionId]);

  // Track diamond operations using existing user_activity_log table
  const trackDiamondOperation = useCallback(async (operation: string, diamondData?: any) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_activity_log')
        .insert({
          telegram_id: user.id,
          activity_type: 'diamond_operation',
          activity_data: {
            operation_type: operation,
            diamond_data: diamondData
          },
          timestamp: new Date().toISOString(),
          session_id: sessionId
        });

      console.log('Diamond operation tracked:', operation);
    } catch (error) {
      console.error('Error tracking diamond operation:', error);
    }
  }, [user?.id, sessionId]);

  return {
    trackEnhancedPageVisit,
    trackFeatureUsage,
    trackDiamondOperation,
    sessionId
  };
}
