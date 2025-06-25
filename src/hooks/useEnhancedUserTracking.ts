
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface ActivityData {
  page_url?: string;
  feature_used?: string;
  interaction_data?: any;
  duration?: number;
  clicks?: number;
  scroll_depth?: number;
}

export function useEnhancedUserTracking() {
  const { user } = useTelegramAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [pageStartTime, setPageStartTime] = useState<Date>(new Date());
  const activityQueueRef = useRef<any[]>([]);
  const clickCountRef = useRef(0);
  const maxScrollRef = useRef(0);

  // Initialize session with enhanced data capture
  useEffect(() => {
    if (!user?.id) return;

    const initializeEnhancedSession = async () => {
      try {
        const deviceInfo = {
          device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser_info: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          referrer_url: document.referrer || null,
          entry_page: window.location.pathname
        };

        const { data: session, error } = await supabase
          .from('user_sessions')
          .insert({
            telegram_id: user.id,
            pages_visited: 1,
            is_active: true,
            ...deviceInfo
          })
          .select()
          .single();

        if (error) throw error;

        setCurrentSessionId(session.id);
        console.log('Enhanced session initialized:', session.id);

        // Initialize behavior analytics
        await supabase
          .from('user_behavior_analytics')
          .upsert({
            telegram_id: user.id,
            total_page_views: 1,
            last_visit: new Date().toISOString()
          }, {
            onConflict: 'telegram_id'
          });

      } catch (error) {
        console.error('Error initializing enhanced session:', error);
      }
    };

    initializeEnhancedSession();
  }, [user?.id]);

  // Track detailed activity
  const trackActivity = async (activityType: string, activityData?: ActivityData) => {
    if (!user?.id || !currentSessionId) return;

    const activity = {
      telegram_id: user.id,
      session_id: currentSessionId,
      activity_type: activityType,
      activity_data: activityData,
      page_url: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    // Queue activity for batch processing
    activityQueueRef.current.push(activity);
    
    // Process queue every 5 activities or 30 seconds
    if (activityQueueRef.current.length >= 5) {
      await flushActivityQueue();
    }
  };

  // Flush activity queue
  const flushActivityQueue = async () => {
    if (activityQueueRef.current.length === 0) return;

    try {
      await supabase
        .from('user_activity_log')
        .insert(activityQueueRef.current);
      
      activityQueueRef.current = [];
    } catch (error) {
      console.error('Error flushing activity queue:', error);
    }
  };

  // Track page visit with enhanced data
  const trackEnhancedPageVisit = async (pagePath: string, pageTitle?: string) => {
    if (!user?.id || !currentSessionId) return;

    const timeSpent = Date.now() - pageStartTime.getTime();
    
    try {
      await supabase
        .from('page_visits')
        .insert({
          session_id: currentSessionId,
          page_path: pagePath,
          page_title: pageTitle || document.title,
          referrer: document.referrer || undefined,
          time_spent: `${Math.round(timeSpent / 1000)} seconds`,
          clicks_count: clickCountRef.current,
          scroll_depth: maxScrollRef.current
        });

      // Update behavior analytics with raw SQL increment
      const { data: currentAnalytics } = await supabase
        .from('user_behavior_analytics')
        .select('total_page_views, total_time_spent')
        .eq('telegram_id', user.id)
        .single();

      if (currentAnalytics) {
        await supabase
          .from('user_behavior_analytics')
          .update({
            total_page_views: currentAnalytics.total_page_views + 1,
            updated_at: new Date().toISOString()
          })
          .eq('telegram_id', user.id);
      }

      // Track activity
      await trackActivity('page_visit', {
        page_url: pagePath,
        duration: Math.round(timeSpent / 1000),
        clicks: clickCountRef.current,
        scroll_depth: maxScrollRef.current
      });

      // Reset counters
      setPageStartTime(new Date());
      clickCountRef.current = 0;
      maxScrollRef.current = 0;

    } catch (error) {
      console.error('Error tracking enhanced page visit:', error);
    }
  };

  // Track diamond operations
  const trackDiamondOperation = async (operation: 'add' | 'edit' | 'delete', diamondData?: any) => {
    await trackActivity(`diamond_${operation}`, { 
      feature_used: 'inventory_management',
      interaction_data: diamondData 
    });

    // Update analytics counters
    try {
      const { data: currentAnalytics } = await supabase
        .from('user_behavior_analytics')
        .select('diamonds_added, diamonds_edited, diamonds_deleted, engagement_score')
        .eq('telegram_id', user!.id)
        .single();

      if (currentAnalytics) {
        const updates: any = {
          engagement_score: currentAnalytics.engagement_score + 5,
          updated_at: new Date().toISOString()
        };

        if (operation === 'add') {
          updates.diamonds_added = currentAnalytics.diamonds_added + 1;
        } else if (operation === 'edit') {
          updates.diamonds_edited = currentAnalytics.diamonds_edited + 1;
        } else if (operation === 'delete') {
          updates.diamonds_deleted = currentAnalytics.diamonds_deleted + 1;
        }

        await supabase
          .from('user_behavior_analytics')
          .update(updates)
          .eq('telegram_id', user!.id);
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  // Track feature usage
  const trackFeatureUsage = async (feature: string, data?: any) => {
    await trackActivity('feature_usage', {
      feature_used: feature,
      interaction_data: data
    });
  };

  // Track clicks
  useEffect(() => {
    const handleClick = () => {
      clickCountRef.current += 1;
    };

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Flush queue periodically
  useEffect(() => {
    const interval = setInterval(flushActivityQueue, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // End session on unmount
  useEffect(() => {
    return () => {
      if (currentSessionId) {
        supabase
          .from('user_sessions')
          .update({
            session_end: new Date().toISOString(),
            is_active: false,
            exit_page: window.location.pathname
          })
          .eq('id', currentSessionId);
        
        flushActivityQueue();
      }
    };
  }, [currentSessionId]);

  return {
    trackEnhancedPageVisit,
    trackDiamondOperation,
    trackFeatureUsage,
    trackActivity,
    currentSessionId
  };
}
