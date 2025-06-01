
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

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

  // Initialize session tracking
  useEffect(() => {
    if (!user?.id) return;

    const initializeSession = async () => {
      try {
        // Create a new session
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
        console.log('Session initialized:', session.id);
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initializeSession();
  }, [user?.id]);

  // Track page visits
  const trackPageVisit = async (pagePath: string, pageTitle?: string) => {
    if (!user?.id || !currentSessionId) return;

    try {
      const { error } = await supabase
        .from('page_visits')
        .insert({
          session_id: currentSessionId,
          page_path: pagePath,
          page_title: pageTitle,
          referrer: document.referrer || undefined
        });

      if (error) throw error;

      // Update session page count
      await supabase
        .from('user_sessions')
        .update({
          pages_visited: await getSessionPageCount(currentSessionId)
        })
        .eq('id', currentSessionId);

      console.log('Page visit tracked:', pagePath);
    } catch (error) {
      console.error('Error tracking page visit:', error);
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

  // End session
  const endSession = async () => {
    if (!currentSessionId) return;

    try {
      await supabase
        .from('user_sessions')
        .update({
          session_end: new Date().toISOString(),
          is_active: false
        })
        .eq('id', currentSessionId);

      console.log('Session ended:', currentSessionId);
    } catch (error) {
      console.error('Error ending session:', error);
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
      
      // Map the data to ensure proper types
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
      
      // Map the data to ensure proper types
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

  // Track page changes
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

  // End session on page unload
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
