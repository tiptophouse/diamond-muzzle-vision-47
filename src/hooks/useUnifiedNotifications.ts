import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface UnifiedNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: any;
  created_at: string;
  source: 'fastapi' | 'supabase' | 'realtime';
}

interface UseUnifiedNotificationsReturn {
  notifications: UnifiedNotification[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  connectionState: 'connecting' | 'connected' | 'error' | 'disconnected';
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

const FETCH_TIMEOUT = 10000; // 10 seconds for mobile
const PAGE_SIZE = 20;
const MAX_RETRIES = 3;
const CACHE_KEY = 'notifications_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useUnifiedNotifications(): UseUnifiedNotificationsReturn {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { user } = useTelegramAuth();
  const { notificationOccurred } = useTelegramHapticFeedback();
  const abortControllerRef = useRef<AbortController | null>(null);
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  
  // Stable toast callback with useCallback
  const { toast } = useToast();
  const showToast = useCallback((title: string, description: string, variant?: 'default' | 'destructive') => {
    toast({ title, description, variant });
  }, [toast]);

  // Load cached notifications instantly
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setNotifications(data);
          console.log('📦 Loaded cached notifications:', data.length);
        }
      } catch (e) {
        console.error('Failed to parse cached notifications:', e);
      }
    }
  }, []);

  // Fetch with timeout and retry logic
  const fetchWithTimeout = useCallback(async (url: string, options: RequestInit, retries = 0): Promise<Response> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), FETCH_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError' && retries < MAX_RETRIES) {
        console.log(`⏱️ Timeout, retrying... (${retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000)); // Exponential backoff
        return fetchWithTimeout(url, options, retries + 1);
      }
      throw err;
    }
  }, []);

  // Fetch notifications from FastAPI with fallback to Supabase
  const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!user?.id) {
      console.log('🔔 No user ID, skipping fetch');
      return;
    }

    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔔 Fetching notifications page ${pageNum}...`);
      
      // Try FastAPI first
      let allNotifications: UnifiedNotification[] = [];
      let fastApiSuccess = false;
      
      try {
        const offset = (pageNum - 1) * PAGE_SIZE;
        const timestamp = Date.now();
        const url = `https://api.mazalbot.com/api/v1/seller/notifications?user_id=${user.id}&limit=${PAGE_SIZE}&offset=${offset}&_t=${timestamp}`;
        
        const response = await fetchWithTimeout(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data)) {
            allNotifications = data
              .filter((item: any) => {
                const buyerId = item.searcher_user_id || item.buyer_id;
                return !buyerId || buyerId !== user.id; // Filter self-notifications
              })
              .map((item: any) => ({
                id: item.id.toString(),
                title: item.result_type === 'match' ? `💎 ${item.diamonds_data?.length || 0} התאמות` : '🔍 חיפוש חדש',
                message: item.search_query || 'חיפוש חדש במערכת',
                type: item.result_type === 'match' ? 'diamond_match' : 'search_result',
                read: false,
                created_at: item.created_at,
                source: 'fastapi' as const,
                data: {
                  search_query: item.search_query,
                  diamonds_data: item.diamonds_data,
                  matches: item.diamonds_data,
                  searcher_info: {
                    telegram_id: item.searcher_user_id || item.buyer_id,
                    name: item.searcher_name || item.buyer_name || 'Buyer',
                    first_name: item.searcher_first_name,
                    telegram_username: item.searcher_username,
                  }
                }
              }));
            
            fastApiSuccess = true;
            console.log(`✅ FastAPI: ${allNotifications.length} notifications`);
          }
        }
      } catch (fastApiError: any) {
        console.log('⚠️ FastAPI failed, falling back to Supabase:', fastApiError.message);
      }
      
      // Fallback to Supabase if FastAPI failed
      if (!fastApiSuccess) {
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('notifications')
          .select('*')
          .eq('telegram_id', user.id)
          .order('created_at', { ascending: false })
          .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1);
        
        if (supabaseError) throw supabaseError;
        
        if (supabaseData) {
          allNotifications = supabaseData.map((item: any) => ({
            id: item.id,
            title: item.metadata?.title || 'Notification',
            message: item.message_content,
            type: item.message_type,
            read: !!item.read_at,
            created_at: item.created_at,
            source: 'supabase' as const,
            data: item.metadata
          }));
          
          console.log(`✅ Supabase fallback: ${allNotifications.length} notifications`);
        }
      }
      
      // Sort: unread first, then by date
      allNotifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      if (!isMountedRef.current) return;
      
      // Update state
      setNotifications(prev => {
        const updated = append ? [...prev, ...allNotifications] : allNotifications;
        
        // Cache to localStorage
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: updated.slice(0, 50), // Cache first 50
            timestamp: Date.now()
          }));
        } catch (e) {
          console.error('Failed to cache notifications:', e);
        }
        
        return updated;
      });
      
      setHasMore(allNotifications.length === PAGE_SIZE);
      setPage(pageNum);
      
    } catch (err: any) {
      console.error('🔔 Fetch error:', err);
      if (isMountedRef.current) {
        setError(err.message);
        showToast('שגיאה', 'לא ניתן לטעון התראות', 'destructive');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, fetchWithTimeout, showToast]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchNotifications(page + 1, true);
  }, [hasMore, isLoading, page, fetchNotifications]);

  // Mark as read with optimistic update
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification?.source === 'supabase') {
        const { error } = await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString(), status: 'read' })
          .eq('id', notificationId);
        
        if (error) throw error;
      }
      
      console.log('✅ Marked as read:', notificationId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      // Rollback on error
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
    }
  }, [notifications]);

  // Setup realtime subscription with stable dependencies
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('🔴 Setting up realtime subscription');
    setConnectionState('connecting');
    
    const channel = supabase
      .channel('unified-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `telegram_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔴 New notification received:', payload);
          
          if (!isMountedRef.current) return;
          
          const newNotification: UnifiedNotification = {
            id: payload.new.id,
            title: payload.new.metadata?.title || 'Notification',
            message: payload.new.message_content,
            type: payload.new.message_type,
            read: false,
            created_at: payload.new.created_at,
            source: 'realtime',
            data: payload.new.metadata
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Haptic feedback
          notificationOccurred('success');
          
          // Show toast
          showToast('🔔 התראה חדשה!', newNotification.message.substring(0, 100));
        }
      )
      .subscribe((status) => {
        console.log('🔴 Subscription status:', status);
        if (isMountedRef.current) {
          setConnectionState(status === 'SUBSCRIBED' ? 'connected' : 
                           status === 'CLOSED' ? 'disconnected' : 'connecting');
        }
      });
    
    channelRef.current = channel;
    
    return () => {
      console.log('🔴 Cleaning up subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, notificationOccurred, showToast]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    
    const timer = setTimeout(() => {
      if (user?.id) {
        fetchNotifications(1, false);
      }
    }, 500);
    
    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    refetch: () => fetchNotifications(1, false),
    markAsRead,
    connectionState,
    hasMore,
    loadMore,
  };
}
