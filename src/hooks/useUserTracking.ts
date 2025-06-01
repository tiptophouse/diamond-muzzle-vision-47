
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface SessionData {
  sessionId: string | null;
  startTime: Date | null;
  pageVisits: number;
  isActive: boolean;
}

export function useUserTracking() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [sessionData, setSessionData] = useState<SessionData>({
    sessionId: null,
    startTime: null,
    pageVisits: 0,
    isActive: false,
  });
  
  const heartbeatInterval = useRef<NodeJS.Timeout>();
  const pageStartTime = useRef<Date>(new Date());
  const lastPath = useRef<string>('');

  // Create or update user profile
  const upsertUserProfile = async () => {
    if (!user || !isAuthenticated) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          telegram_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name || null,
          username: user.username || null,
          language_code: user.language_code || 'en',
          is_premium: false, // Default, can be updated later
        }, {
          onConflict: 'telegram_id'
        });

      if (error) {
        console.error('Error upserting user profile:', error);
      }
    } catch (error) {
      console.error('Error in upsertUserProfile:', error);
    }
  };

  // Start a new session
  const startSession = async () => {
    if (!user || !isAuthenticated) return;

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          telegram_id: user.id,
          user_agent: navigator.userAgent,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return;
      }

      const sessionStart = new Date();
      setSessionData({
        sessionId: data.id,
        startTime: sessionStart,
        pageVisits: 0,
        isActive: true,
      });

      // Initialize user analytics
      await supabase
        .from('user_analytics')
        .upsert({
          telegram_id: user.id,
          total_visits: 1,
          last_active: sessionStart.toISOString(),
        }, {
          onConflict: 'telegram_id'
        });

      console.log('Session started:', data.id);
    } catch (error) {
      console.error('Error in startSession:', error);
    }
  };

  // End current session
  const endSession = async () => {
    if (!sessionData.sessionId || !sessionData.startTime) return;

    try {
      const endTime = new Date();
      const duration = endTime.getTime() - sessionData.startTime.getTime();

      await supabase
        .from('user_sessions')
        .update({
          session_end: endTime.toISOString(),
          total_duration: `${Math.floor(duration / 1000)} seconds`,
          pages_visited: sessionData.pageVisits,
          is_active: false,
        })
        .eq('id', sessionData.sessionId);

      console.log('Session ended:', sessionData.sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Track page visit
  const trackPageVisit = async (path: string, title?: string) => {
    if (!sessionData.sessionId || !user) return;

    try {
      // End previous page visit if exists
      if (lastPath.current) {
        const timeSpent = new Date().getTime() - pageStartTime.current.getTime();
        await supabase
          .from('page_visits')
          .insert({
            session_id: sessionData.sessionId,
            page_path: lastPath.current,
            page_title: document.title,
            time_spent: `${Math.floor(timeSpent / 1000)} seconds`,
          });
      }

      // Start new page visit
      pageStartTime.current = new Date();
      lastPath.current = path;

      // Update session page count
      setSessionData(prev => ({
        ...prev,
        pageVisits: prev.pageVisits + 1,
      }));

      console.log('Page visit tracked:', path);
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  };

  // Send heartbeat to keep session active
  const sendHeartbeat = async () => {
    if (!sessionData.sessionId || !user) return;

    try {
      await supabase
        .from('user_analytics')
        .update({
          last_active: new Date().toISOString(),
        })
        .eq('telegram_id', user.id);
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  };

  // Track cost for user action
  const trackCost = async (costType: string, serviceName: string, amount: number, details?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('cost_tracking')
        .insert({
          telegram_id: user.id,
          cost_type: costType,
          service_name: serviceName,
          amount,
          usage_details: details,
        });

      // Update user analytics with new cost
      const { data: analytics } = await supabase
        .from('user_analytics')
        .select('cost_per_user, api_calls_count')
        .eq('telegram_id', user.id)
        .single();

      if (analytics) {
        const updateData: any = {
          cost_per_user: (analytics.cost_per_user || 0) + amount,
        };

        if (costType === 'api_call') {
          updateData.api_calls_count = (analytics.api_calls_count || 0) + 1;
        }

        await supabase
          .from('user_analytics')
          .update(updateData)
          .eq('telegram_id', user.id);
      }

      console.log('Cost tracked:', { costType, serviceName, amount });
    } catch (error) {
      console.error('Error tracking cost:', error);
    }
  };

  // Initialize tracking when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      upsertUserProfile();
      startSession();

      // Start heartbeat
      heartbeatInterval.current = setInterval(sendHeartbeat, 30000); // Every 30 seconds

      // Track initial page
      trackPageVisit(window.location.pathname, document.title);
    }

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      endSession();
    };
  }, [isAuthenticated, user]);

  // Track page changes
  useEffect(() => {
    const handlePopState = () => {
      trackPageVisit(window.location.pathname, document.title);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sessionData.sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionData]);

  return {
    sessionData,
    trackPageVisit,
    trackCost,
    isTracking: !!sessionData.sessionId,
  };
}
