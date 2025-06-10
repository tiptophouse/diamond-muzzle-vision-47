
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchNotifications = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔔 Fetching notifications for user:', user.id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('telegram_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('❌ Notifications fetch failed:', error);
        throw error;
      }

      console.log('🔔 Notifications fetched:', data?.length || 0);

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

      // Show toast for new important notifications
      const newImportantNotifications = transformedNotifications.filter(
        n => !n.read && ['diamond_match', 'inventory_upload', 'price_alert'].includes(n.type)
      );
      
      if (newImportantNotifications.length > 0) {
        toast({
          title: "🔔 התראות חדשות!",
          description: `יש לך ${newImportantNotifications.length} התראות חדשות`,
        });
      }

    } catch (error) {
      console.warn('❌ Notifications fetch failed, using sample data:', error);
      
      // Create sample notifications if database fetch fails
      setNotifications([
        {
          id: 'welcome-1',
          title: 'ברוכים הבאים ל-Diamond Dashboard!',
          message: 'המערכת מוכנה לעבודה. התחל בהעלאת המלאי שלך',
          type: 'welcome',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'system-1',
          title: 'מערכת ההתראות פעילה',
          message: 'תקבל התראות על פעילות במלאי, הזמנות חדשות ועדכוני מחירים',
          type: 'system',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
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
      case 'inventory_upload':
        const uploadCount = metadata?.upload_count || 0;
        return `📁 הועלו ${uploadCount} יהלומים למלאי`;
      case 'customer_inquiry':
        return '👤 פנייה חדשה מלקוח';
      case 'price_alert':
        return '💰 התראת מחיר';
      case 'system':
        return '⚙️ הודעת מערכת';
      case 'welcome':
        return '🎉 ברוכים הבאים';
      default:
        return '📢 התראה חדשה';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', notificationId);

      if (error) {
        console.warn('❌ Mark as read failed:', error);
      }

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
      console.warn('❌ Mark as read failed:', error);
      
      // Update locally even if database update fails
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

    console.log('🔔 Setting up real-time notifications for user:', user.id);

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
          toast({
            title: "🔔 התראה חדשה!",
            description: newNotification.message,
          });
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
