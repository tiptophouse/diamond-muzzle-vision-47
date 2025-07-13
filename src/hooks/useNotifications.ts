
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const setUserContext = async () => {
    if (user?.id && user.id !== getCurrentUserId()) {
      setCurrentUserId(user.id);
      
      await supabase.functions.invoke('set-session-context', {
        body: {
          setting_name: 'app.current_user_id',
          setting_value: user.id.toString()
        }
      });
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await setUserContext();

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

      const transformedNotifications = (data || []).map(notification => ({
        id: notification.id,
        title: getNotificationTitle(notification.message_type, notification.metadata),
        message: notification.message_content,
        type: notification.message_type,
        read: !!notification.read_at,
        data: notification.metadata,
        created_at: notification.sent_at,
      }));

      setNotifications(transformedNotifications);

      // Show toast for new diamond match notifications
      const newDiamondMatches = transformedNotifications.filter(
        n => n.type === 'diamond_match' && !n.read
      );
      
      if (newDiamondMatches.length > 0) {
        toast({
          title: "🔔 התראת התאמת יהלומים חדשה!",
          description: `נמצאו ${newDiamondMatches.length} התאמות חדשות לבקשות חיפוש`,
        });
      }

    } catch (error) {
      console.warn('Notifications fetch failed, using fallback:', error);
      
      setNotifications([
        {
          id: 'welcome-1',
          title: 'ברוכים הבאים ל-Diamond Muzzle!',
          message: 'המערכת מוכנה לשלוח לך התראות על יהלומים דומים למלאי שלך',
          type: 'info',
          read: false,
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationTitle = (type: string, metadata?: any): string => {
    switch (type) {
      case 'diamond_match':
        const matchCount = metadata?.match_count || 1;
        return `🔍 נמצאו ${matchCount} התאמות לבקשת חיפוש`;
      case 'customer_inquiry':
        return '👤 פנייה חדשה מלקוח';
      case 'buyer_interest':
        return '💎 קונה מעוניין ביהלום שלך';
      case 'wishlist_added':
        return '⭐ יהלום נוסף לרשימת המועדפים';
      case 'price_alert':
        return '💰 התראת מחיר';
      case 'system':
        return '⚙️ הודעת מערכת';
      default:
        return '📢 התראה חדשה';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await setUserContext();

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );

      toast({
        title: "הודעה נקראה",
        description: "ההתראה סומנה כנקראה",
      });
    } catch (error) {
      console.warn('Mark as read failed:', error);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  const contactCustomer = (customerInfo: any) => {
    if (customerInfo.phone) {
      window.open(`tel:${customerInfo.phone}`);
    } else if (customerInfo.email) {
      window.open(`mailto:${customerInfo.email}`);
    }
  };

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `telegram_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 New notification received:', payload);
          
          const newNotification = {
            id: payload.new.id,
            title: getNotificationTitle(payload.new.message_type, payload.new.metadata),
            message: payload.new.message_content,
            type: payload.new.message_type,
            read: false,
            data: payload.new.metadata,
            created_at: payload.new.sent_at,
          };

          setNotifications(prev => [newNotification, ...prev]);

          // Show real-time toast
          if (payload.new.message_type === 'diamond_match') {
            toast({
              title: "🔔 התראת התאמה חדשה!",
              description: "נמצאה התאמה לבקשת חיפוש יהלום",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  useEffect(() => {
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
    contactCustomer,
    refetch: fetchNotifications,
  };
}
