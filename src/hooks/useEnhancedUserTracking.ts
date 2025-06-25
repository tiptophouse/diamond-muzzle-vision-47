
import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserSession {
  telegram_id: number;
  session_start: string;
  last_activity: string;
  session_data: any;
  platform: string;
  user_agent: string;
}

interface PageVisit {
  telegram_id: number;
  page: string;
  page_title: string;
  visit_time: string;
  session_id: string;
  time_spent?: number;
}

interface DiamondOperation {
  telegram_id: number;
  operation_type: string;
  operation_data: any;
  timestamp: string;
  session_id: string;
}

export function useEnhancedUserTracking() {
  const { user } = useTelegramAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [pageStartTime, setPageStartTime] = useState<Date>(new Date());

  // Initialize session tracking
  useEffect(() => {
    if (user?.id) {
      initializeSession();
    }
  }, [user?.id]);

  const initializeSession = async () => {
    if (!user?.id) return;

    const sessionId = `session_${user.id}_${Date.now()}`;
    setCurrentSessionId(sessionId);

    try {
      const sessionData: UserSession = {
        telegram_id: user.id,
        session_start: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        session_data: {
          user_info: {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username
          },
          session_id: sessionId
        },
        platform: 'web',
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('user_sessions')
        .insert([sessionData]);

      if (error) {
        console.error('❌ Error tracking session:', error);
      } else {
        console.log('✅ Session initialized:', sessionId);
      }
    } catch (error) {
      console.error('❌ Session tracking error:', error);
    }
  };

  // Update session activity
  const updateSessionActivity = async () => {
    if (!user?.id || !currentSessionId) return;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          last_activity: new Date().toISOString() 
        })
        .eq('telegram_id', user.id)
        .eq('session_data->session_id', currentSessionId);

      if (error) {
        console.error('❌ Error updating session activity:', error);
      }
    } catch (error) {
      console.error('❌ Session update error:', error);
    }
  };

  // Track page visits with enhanced data
  const trackEnhancedPageVisit = async (page: string, pageTitle: string) => {
    if (!user?.id || !currentSessionId) return;

    // Calculate time spent on previous page
    const timeSpent = Math.round((new Date().getTime() - pageStartTime.getTime()) / 1000);
    setPageStartTime(new Date());

    try {
      const visitData: PageVisit = {
        telegram_id: user.id,
        page,
        page_title: pageTitle,
        visit_time: new Date().toISOString(),
        session_id: currentSessionId,
        time_spent: timeSpent > 0 ? timeSpent : undefined
      };

      const { error } = await supabase
        .from('page_visits')
        .insert([visitData]);

      // Also update session activity
      await updateSessionActivity();

      if (error) {
        console.error('❌ Error tracking page visit:', error);
      } else {
        console.log('✅ Page visit tracked:', page, pageTitle);
      }
    } catch (error) {
      console.error('❌ Page visit tracking error:', error);
    }
  };

  // Track diamond operations (add, edit, delete)
  const trackDiamondOperation = async (operationType: string, operationData: any) => {
    if (!user?.id || !currentSessionId) return;

    try {
      const operation: DiamondOperation = {
        telegram_id: user.id,
        operation_type: operationType,
        operation_data: operationData,
        timestamp: new Date().toISOString(),
        session_id: currentSessionId
      };

      const { error } = await supabase
        .from('diamond_operations')
        .insert([operation]);

      // Also update session activity
      await updateSessionActivity();

      if (error) {
        console.error('❌ Error tracking diamond operation:', error);
      } else {
        console.log('✅ Diamond operation tracked:', operationType, operationData);
      }
    } catch (error) {
      console.error('❌ Diamond operation tracking error:', error);
    }
  };

  // Track feature usage
  const trackFeatureUsage = async (feature: string, data: any = {}) => {
    if (!user?.id || !currentSessionId) return;

    try {
      const featureData = {
        telegram_id: user.id,
        feature_name: feature,
        usage_data: data,
        timestamp: new Date().toISOString(),
        session_id: currentSessionId
      };

      const { error } = await supabase
        .from('feature_usage')
        .insert([featureData]);

      // Also update session activity
      await updateSessionActivity();

      if (error) {
        console.error('❌ Error tracking feature usage:', error);
      } else {
        console.log('✅ Feature usage tracked:', feature, data);
      }
    } catch (error) {
      console.error('❌ Feature usage tracking error:', error);
    }
  };

  return {
    trackEnhancedPageVisit,
    trackDiamondOperation,
    trackFeatureUsage,
    updateSessionActivity,
    currentSessionId
  };
}
