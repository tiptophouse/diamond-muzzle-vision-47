import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { realTimeAnalyticsService } from '@/services/realTimeAnalyticsService';

interface UserSession {
  id: string;
  telegram_id: number;
  user_id?: string;
  session_start: string;
  session_end?: string;
  total_duration?: string | null;
  pages_visited: number;
  is_active: boolean;
  user_agent?: string;
  created_at: string;
}

interface PageVisit {
  id: string;
  session_id?: string;
  page_path: string;
  page_title?: string;
  visit_timestamp: string;
  time_spent?: string | null;
  referrer?: string;
  created_at: string;
}

export function useUserTracking() {
  const { user } = useTelegramAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [pageVisits, setPageVisits] = useState<PageVisit[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session tracking with enhanced real-time service
  useEffect(() => {
    if (!user?.id) return;

    const initializeSession = async () => {
      try {
        console.log('🚀 Initializing enhanced user session tracking');
        
        const sessionId = await realTimeAnalyticsService.startUserSession(
          user.id,
          navigator.userAgent
        );

        if (sessionId) {
          setCurrentSessionId(sessionId);
          console.log('✅ Enhanced session initialized:', sessionId);
        } else {
          console.error('❌ Failed to initialize enhanced session');
          // Fallback to basic session creation
          const { data: session, error } = await supabase
            .from('user_sessions')
            .insert({
              telegram_id: user.id,
              user_agent: navigator.userAgent,
              pages_visited: 0,
              is_active: true
            })
            .select()
            .single();

          if (error) throw error;
          setCurrentSessionId(session.id);
          console.log('✅ Fallback session initialized:', session.id);
        }
      } catch (error) {
        console.error('❌ Error initializing session:', error);
      }
    };

    initializeSession();
  }, [user?.id]);

  // Enhanced page visit tracking
  const trackPageVisit = async (pagePath: string, pageTitle?: string) => {
    if (!user?.id || !currentSessionId) return;

    try {
      console.log('📄 Enhanced page visit tracking:', pagePath);
      
      // Use real-time service for tracking
      const success = await realTimeAnalyticsService.trackPageVisit(
        currentSessionId,
        pagePath,
        pageTitle
      );

      if (success) {
        console.log('✅ Enhanced page visit tracked:', pagePath);
      } else {
        console.warn('⚠️ Enhanced tracking failed, using fallback');
        // Fallback to direct Supabase insert
        const { error } = await supabase
          .from('page_visits')
          .insert({
            session_id: currentSessionId,
            page_path: pagePath,
            page_title: pageTitle,
            referrer: document.referrer || undefined
          });

        if (error) throw error;
        console.log('✅ Fallback page visit tracked:', pagePath);
      }

      // Update local session page count
      await supabase
        .from('user_sessions')
        .update({
          pages_visited: await getSessionPageCount(currentSessionId)
        })
        .eq('id', currentSessionId);

    } catch (error) {
      console.error('❌ Error tracking page visit:', error);
    }
  };

  // Get session page count
  const getSessionPageCount = async (sessionId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting session page count:', error);
      return 0;
    }
  };

  // Enhanced session ending
  const endSession = async () => {
    if (!currentSessionId) return;

    try {
      console.log('🛑 Ending enhanced session:', currentSessionId);
      
      const success = await realTimeAnalyticsService.endUserSession(currentSessionId);
      
      if (success) {
        console.log('✅ Enhanced session ended:', currentSessionId);
      } else {
        console.warn('⚠️ Enhanced session end failed, using fallback');
        // Fallback to direct Supabase update
        await supabase
          .from('user_sessions')
          .update({
            session_end: new Date().toISOString(),
            is_active: false
          })
          .eq('id', currentSessionId);
        
        console.log('✅ Fallback session ended:', currentSessionId);
      }
    } catch (error) {
      console.error('❌ Error ending session:', error);
    }
  };

  // Fetch all sessions (admin only)
  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedSessions = (data || []).map(session => ({
        ...session,
        total_duration: session.total_duration ? String(session.total_duration) : null,
        pages_visited: session.pages_visited || 0,
        is_active: session.is_active || false
      }));
      
      setSessions(mappedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Fetch all page visits (admin only)
  const fetchPageVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('page_visits')
        .select('*')
        .order('visit_timestamp', { ascending: false });

      if (error) throw error;
      
      const mappedVisits = (data || []).map(visit => ({
        ...visit,
        time_spent: visit.time_spent ? String(visit.time_spent) : null
      }));
      
      setPageVisits(mappedVisits);
    } catch (error) {
      console.error('Error fetching page visits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchSessions();
    fetchPageVisits();
  }, []);

  // Enhanced page change tracking
  useEffect(() => {
    const handlePageChange = () => {
      const currentPath = window.location.hash.replace('#', '') || '/';
      const currentTitle = document.title;
      trackPageVisit(currentPath, currentTitle);
    };

    // Track initial page load
    handlePageChange();

    // Listen for hash changes (since we're using HashRouter)
    window.addEventListener('hashchange', handlePageChange);

    return () => {
      window.removeEventListener('hashchange', handlePageChange);
    };
  }, [currentSessionId]);

  // Enhanced session cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [currentSessionId]);

  return {
    sessions,
    pageVisits,
    currentSessionId,
    isLoading,
    trackPageVisit,
    endSession,
    refetch: () => {
      fetchSessions();
      fetchPageVisits();
    }
  };
}
