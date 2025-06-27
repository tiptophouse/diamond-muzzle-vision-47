
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface PageVisit {
  page_path: string;
  page_title: string;
  visit_timestamp: string;
  referrer?: string;
  time_spent?: number;
  scroll_depth?: number;
  clicks_count?: number;
  form_interactions?: number;
  session_id?: string;
  interaction_data?: any;
}

interface UserSession {
  session_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  pages_visited: number;
  total_time_spent: number;
  device_type?: string;
  browser_info?: string;
  screen_resolution?: string;
  referrer_url?: string;
  entry_page?: string;
  exit_page?: string;
  is_active: boolean;
}

interface FeatureUsage {
  feature_name: string;
  usage_count: number;
  last_used: string;
  context_data?: any;
}

export function useEnhancedUserTracking() {
  const { user } = useTelegramAuth();
  const [sessionId, setSessionId] = useState<string>('');
  const [pageVisits, setPageVisits] = useState<PageVisit[]>([]);
  const [startTime, setStartTime] = useState<Date>(new Date());

  // Generate session ID
  useEffect(() => {
    const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Start user session
  const startSession = useCallback(async () => {
    if (!user?.id || !sessionId) return;

    try {
      const sessionData: UserSession = {
        session_id: sessionId,
        user_id: user.id.toString(),
        start_time: new Date().toISOString(),
        pages_visited: 0,
        total_time_spent: 0,
        device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        browser_info: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        referrer_url: document.referrer || 'direct',
        entry_page: window.location.pathname,
        is_active: true
      };

      await supabase
        .from('user_sessions')
        .insert(sessionData);

    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [user?.id, sessionId]);

  // Track page visit
  const trackEnhancedPageVisit = useCallback(async (pagePath: string, pageTitle: string) => {
    if (!user?.id || !sessionId) return;

    const visitData: PageVisit = {
      page_path: pagePath,
      page_title: pageTitle,
      visit_timestamp: new Date().toISOString(),
      referrer: document.referrer || undefined,
      session_id: sessionId,
      time_spent: 0,
      scroll_depth: 0,
      clicks_count: 0,
      form_interactions: 0
    };

    setPageVisits(prev => [...prev, visitData]);

    try {
      await supabase
        .from('user_page_visits')
        .insert(visitData);

      console.log('Page visit tracked:', pagePath);
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  }, [user?.id, sessionId]);

  // Track feature usage
  const trackFeatureUsage = useCallback(async (featureName: string, contextData?: any) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_feature_usage')
        .insert({
          user_id: user.id.toString(),
          feature_name: featureName,
          usage_timestamp: new Date().toISOString(),
          context_data: contextData,
          session_id: sessionId
        });

      console.log('Feature usage tracked:', featureName);
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }, [user?.id, sessionId]);

  // Track diamond operations
  const trackDiamondOperation = useCallback(async (operation: string, diamondData?: any) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_diamond_operations')
        .insert({
          user_id: user.id.toString(),
          operation_type: operation,
          diamond_data: diamondData,
          timestamp: new Date().toISOString(),
          session_id: sessionId
        });

      console.log('Diamond operation tracked:', operation);
    } catch (error) {
      console.error('Error tracking diamond operation:', error);
    }
  }, [user?.id, sessionId]);

  // End session
  const endSession = useCallback(async () => {
    if (!user?.id || !sessionId) return;

    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    try {
      await supabase
        .from('user_sessions')
        .update({
          end_time: endTime.toISOString(),
          total_time_spent: totalTime,
          pages_visited: pageVisits.length,
          exit_page: window.location.pathname,
          is_active: false
        })
        .eq('session_id', sessionId);

    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [user?.id, sessionId, startTime, pageVisits.length]);

  // Initialize session on mount
  useEffect(() => {
    if (user?.id && sessionId) {
      startSession();
    }

    // End session on page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [user?.id, sessionId, startSession, endSession]);

  return {
    trackEnhancedPageVisit,
    trackFeatureUsage,
    trackDiamondOperation,
    sessionId,
    pageVisits
  };
}
