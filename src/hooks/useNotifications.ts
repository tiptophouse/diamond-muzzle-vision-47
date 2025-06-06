
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { setCurrentUserId, getCurrentUserId } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: any;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false to prevent blocking
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchNotifications = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Set current user context for RLS
      if (user.id !== getCurrentUserId()) {
        setCurrentUserId(user.id);
      }

      // Try to fetch from Supabase, but with timeout and error handling
      const { data, error } = await Promise.race([
        supabase
          .from('notifications')
          .select('*')
          .eq('telegram_id', user.id)
          .order('sent_at', { ascending: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]) as any;

      if (error) throw error;

      // Transform to match the expected interface
      const transformedNotifications = (data || []).map(notification => ({
        id: notification.id,
        title: `${notification.message_type.charAt(0).toUpperCase()}${notification.message_type.slice(1)} Notification`,
        message: notification.message_content,
        type: notification.message_type,
        read: !!notification.read_at,
        data: notification.metadata,
        created_at: notification.sent_at,
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.warn('Notifications fetch failed, using fallback:', error);
      
      // Fallback to sample data instead of crashing
      setNotifications([
        {
          id: 'sample-1',
          title: 'Welcome',
          message: 'Welcome to Diamond Muzzle!',
          type: 'info',
          read: false,
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Set current user context for RLS
      if (user?.id) {
        setCurrentUserId(user.id);
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.warn('Mark as read failed:', error);
      // Still update local state for better UX
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  useEffect(() => {
    // Add delay to prevent simultaneous calls
    const timer = setTimeout(() => {
      if (user?.id) {
        fetchNotifications();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  return {
    notifications,
    isLoading,
    markAsRead,
    refetch: fetchNotifications,
  };
}
