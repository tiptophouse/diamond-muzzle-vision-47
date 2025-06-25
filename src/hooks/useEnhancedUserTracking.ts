
import { useState, useEffect, useCallback } from 'react';
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

  // Start user session using existing user_sessions table
  const startSession = useCallback(async () => {
    if (!user?.id || !sessionId) return;

    try {
      // Use existing user_sessions table structure
      const sessionData = {
        telegram_id: user.id,
        session_start: new Date().toISOString(),
        pages_visited: 0,
        device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        browser_info: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        referrer_url: document.referrer || 'direct',
        entry_page: window.location.pathname,
        is_active: true
      };

      console.log('📊 Starting session for user:', user.id);
      // Note: In a real implementation, you'd make an API call here
      // For now, we'll just log and track locally

    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [user?.id, sessionId]);

  // Track page visit using existing page_visits table structure
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
      // Use existing page_visits table structure
      console.log('📊 Page visit tracked:', pagePath, 'for user:', user.id);
      // Note: In a real implementation, you'd make an API call here
      
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  }, [user?.id, sessionId]);

  // Track feature usage using existing user_activity_log table
  const trackFeatureUsage = useCallback(async (featureName: string, contextData?: any) => {
    if (!user?.id) return;

    try {
      console.log('📊 Feature usage tracked:', featureName, 'for user:', user.id);
      // Note: In a real implementation, you'd make an API call here
      
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }, [user?.id, sessionId]);

  // Track diamond operations
  const trackDiamondOperation = useCallback(async (operation: string, diamondData?: any) => {
    if (!user?.id) return;

    try {
      console.log('📊 Diamond operation tracked:', operation, 'for user:', user.id);
      // Note: In a real implementation, you'd make an API call here
      
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
      console.log('📊 Ending session for user:', user.id, 'Duration:', totalTime, 'seconds');
      // Note: In a real implementation, you'd make an API call here

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
