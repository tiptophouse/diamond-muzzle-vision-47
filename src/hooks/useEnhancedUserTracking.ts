
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';

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
  device_info?: string;
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

interface AnalyticsSummary {
  totalSessions: number;
  totalPageViews: number;
  uniqueUsers: number;
  last24Hours: {
    sessions: number;
    pageViews: number;
    uniqueUsers: number;
  };
  last7Days: {
    sessions: number;
    pageViews: number;
    uniqueUsers: number;
  };
}

export function useEnhancedUserTracking() {
  const { user, isAuthenticated, isTelegramEnvironment } = useTelegramAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [pageVisits, setPageVisits] = useState<PageVisit[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  
  const sessionInitializedRef = useRef(false);
  const lastPageRef = useRef<string>('');
  const pageStartTimeRef = useRef<Date>(new Date());

  // Enhanced session initialization with better error handling and device detection
  const initializeSession = useCallback(async () => {
    if (!user?.id || !isAuthenticated || sessionInitializedRef.current) {
      console.log('🚫 Session initialization skipped:', { 
        hasUser: !!user?.id, 
        isAuthenticated, 
        alreadyInitialized: sessionInitializedRef.current 
      });
      return;
    }

    try {
      console.log('🚀 Initializing session for user:', user.id, user.first_name);
      
      // Get device and browser info
      const deviceInfo = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        isTelegram: isTelegramEnvironment,
        timestamp: new Date().toISOString()
      };

      // Create a new session with enhanced device tracking
      const { data: session, error } = await supabase
        .from('user_sessions')
        .insert({
          telegram_id: user.id,
          user_agent: navigator.userAgent,
          device_info: JSON.stringify(deviceInfo),
          pages_visited: 0,
          is_active: true,
          session_start: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Session creation failed:', error);
        toast({
          title: "Session Tracking Error",
          description: "Failed to initialize session tracking",
          variant: "destructive",
        });
        return;
      }

      setCurrentSessionId(session.id);
      sessionInitializedRef.current = true;
      
      console.log('✅ Session initialized successfully:', session.id);
      console.log('📱 Device info:', deviceInfo);
      
      // Update user analytics
      await updateUserAnalytics(user.id);
      
      // Track initial page visit
      const initialPath = window.location.hash.replace('#', '') || '/';
      await trackPageVisit(initialPath, document.title);

    } catch (error) {
      console.error('❌ Session initialization error:', error);
      toast({
        title: "Tracking Error",
        description: "Failed to start session tracking",
        variant: "destructive",
      });
    }
  }, [user?.id, isAuthenticated, isTelegramEnvironment, toast]);

  // Enhanced page visit tracking with better timing and error handling
  const trackPageVisit = useCallback(async (pagePath: string, pageTitle?: string) => {
    if (!user?.id || !currentSessionId) {
      console.log('🚫 Page visit tracking skipped:', { hasUser: !!user?.id, hasSession: !!currentSessionId });
      return;
    }

    try {
      // Calculate time spent on previous page
      const now = new Date();
      const timeSpent = lastPageRef.current ? 
        Math.floor((now.getTime() - pageStartTimeRef.current.getTime()) / 1000) : 0;

      console.log('📊 Tracking page visit:', { pagePath, pageTitle, timeSpent });

      const { error } = await supabase
        .from('page_visits')
        .insert({
          session_id: currentSessionId,
          page_path: pagePath,
          page_title: pageTitle || 'Untitled Page',
          referrer: document.referrer || undefined,
          visit_timestamp: now.toISOString(),
          time_spent: timeSpent > 0 ? `${timeSpent} seconds` : null
        });

      if (error) {
        console.error('❌ Page visit tracking failed:', error);
        return;
      }

      // Update session page count
      const pageCount = await getSessionPageCount(currentSessionId);
      await supabase
        .from('user_sessions')
        .update({
          pages_visited: pageCount,
          updated_at: now.toISOString()
        })
        .eq('id', currentSessionId);

      // Update references for next page
      lastPageRef.current = pagePath;
      pageStartTimeRef.current = now;

      console.log('✅ Page visit tracked successfully');
      
      // Refresh analytics
      fetchAnalyticsSummary();

    } catch (error) {
      console.error('❌ Page visit tracking error:', error);
    }
  }, [user?.id, currentSessionId]);

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

  // Update user analytics with better aggregation
  const updateUserAnalytics = async (telegramId: number) => {
    try {
      const { error } = await supabase
        .from('user_analytics')
        .upsert({
          telegram_id: telegramId,
          total_visits: 1,
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'telegram_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ User analytics update failed:', error);
      } else {
        console.log('✅ User analytics updated');
      }
    } catch (error) {
      console.error('❌ User analytics error:', error);
    }
  };

  // Fetch comprehensive analytics summary
  const fetchAnalyticsSummary = useCallback(async () => {
    try {
      console.log('📊 Fetching analytics summary...');
      
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get total sessions with proper type casting
      const { data: allSessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get total page visits with proper type casting
      const { data: allPageVisits, error: pageVisitsError } = await supabase
        .from('page_visits')
        .select('*')
        .order('visit_timestamp', { ascending: false });

      if (pageVisitsError) throw pageVisitsError;

      // Transform sessions data with proper type casting
      const transformedSessions: UserSession[] = (allSessions || []).map(session => ({
        ...session,
        total_duration: session.total_duration ? String(session.total_duration) : null,
        pages_visited: session.pages_visited || 0,
        is_active: session.is_active || false
      }));

      // Transform page visits data with proper type casting
      const transformedPageVisits: PageVisit[] = (allPageVisits || []).map(visit => ({
        ...visit,
        time_spent: visit.time_spent ? String(visit.time_spent) : null
      }));

      // Calculate analytics
      const totalSessions = transformedSessions.length;
      const totalPageViews = transformedPageVisits.length;
      const uniqueUsers = new Set(transformedSessions.map(s => s.telegram_id)).size;

      // Last 24 hours
      const sessions24h = transformedSessions.filter(s => 
        new Date(s.created_at) > last24Hours
      ).length;
      const pageViews24h = transformedPageVisits.filter(p => 
        new Date(p.visit_timestamp) > last24Hours
      ).length;
      const uniqueUsers24h = new Set(
        transformedSessions.filter(s => new Date(s.created_at) > last24Hours)
          .map(s => s.telegram_id)
      ).size;

      // Last 7 days
      const sessions7d = transformedSessions.filter(s => 
        new Date(s.created_at) > last7Days
      ).length;
      const pageViews7d = transformedPageVisits.filter(p => 
        new Date(p.visit_timestamp) > last7Days
      ).length;
      const uniqueUsers7d = new Set(
        transformedSessions.filter(s => new Date(s.created_at) > last7Days)
          .map(s => s.telegram_id)
      ).size;

      const summary: AnalyticsSummary = {
        totalSessions,
        totalPageViews,
        uniqueUsers,
        last24Hours: {
          sessions: sessions24h,
          pageViews: pageViews24h,
          uniqueUsers: uniqueUsers24h
        },
        last7Days: {
          sessions: sessions7d,
          pageViews: pageViews7d,
          uniqueUsers: uniqueUsers7d
        }
      };

      setAnalytics(summary);
      setSessions(transformedSessions);
      setPageVisits(transformedPageVisits);

      console.log('📊 Analytics summary:', summary);
      
    } catch (error) {
      console.error('❌ Analytics fetch error:', error);
    }
  }, []);

  // Enhanced session end with proper duration calculation
  const endSession = useCallback(async () => {
    if (!currentSessionId) return;

    try {
      const sessionEnd = new Date().toISOString();
      
      // Get session start time to calculate duration
      const { data: session } = await supabase
        .from('user_sessions')
        .select('session_start')
        .eq('id', currentSessionId)
        .single();

      let totalDuration = null;
      if (session?.session_start) {
        const startTime = new Date(session.session_start);
        const endTime = new Date(sessionEnd);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.floor(durationMs / 60000);
        totalDuration = `${durationMinutes} minutes`;
      }

      await supabase
        .from('user_sessions')
        .update({
          session_end: sessionEnd,
          is_active: false,
          total_duration: totalDuration,
          updated_at: sessionEnd
        })
        .eq('id', currentSessionId);

      console.log('✅ Session ended:', currentSessionId, 'Duration:', totalDuration);
      
    } catch (error) {
      console.error('❌ Session end error:', error);
    }
  }, [currentSessionId]);

  // Initialize session when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && !sessionInitializedRef.current) {
      console.log('🔄 Auth state changed, initializing session...');
      initializeSession();
    }
  }, [isAuthenticated, user?.id, initializeSession]);

  // Track page changes
  useEffect(() => {
    const handlePageChange = () => {
      const currentPath = window.location.hash.replace('#', '') || '/';
      const currentTitle = document.title;
      trackPageVisit(currentPath, currentTitle);
    };

    // Track initial page load
    if (currentSessionId) {
      handlePageChange();
    }

    // Listen for hash changes (since we're using HashRouter)
    window.addEventListener('hashchange', handlePageChange);
    
    // Listen for popstate changes
    window.addEventListener('popstate', handlePageChange);

    return () => {
      window.removeEventListener('hashchange', handlePageChange);
      window.removeEventListener('popstate', handlePageChange);
    };
  }, [currentSessionId, trackPageVisit]);

  // End session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      endSession();
    };
  }, [endSession]);

  // Initial data load
  useEffect(() => {
    fetchAnalyticsSummary().finally(() => setIsLoading(false));
  }, [fetchAnalyticsSummary]);

  return {
    sessions,
    pageVisits,
    currentSessionId,
    isLoading,
    analytics,
    trackPageVisit,
    endSession,
    refetch: fetchAnalyticsSummary,
    initializeSession
  };
}
