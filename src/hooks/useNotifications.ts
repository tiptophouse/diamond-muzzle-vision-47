
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

      // Add some sample business notifications for demo
      const sampleNotifications = [
        {
          id: 'buyer-interest-1',
          title: '💎 קונה מעוניין ביהלום שלך',
          message: 'לקוח מחפש יהלום דומה ל-RD001 - 1.2ct F VS1. הוא מוכן לשלם עד $8,500.',
          type: 'buyer_interest',
          read: false,
          data: {
            diamond_stock: 'RD001',
            buyer_info: { name: 'David Cohen', phone: '+972-50-123-4567' },
            max_budget: 8500,
            requirements: { shape: 'Round', carat_min: 1.0, carat_max: 1.5, color: 'F', clarity: 'VS1' }
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'pair-match-1',
          title: '💍 נמצא זוג מושלם ליהלום שלך',
          message: 'יהלום PR002 שלך יכול להיות חלק מזוג עגילים מושלם עם יהלום דומה מהמלאי של יעקב לוי.',
          type: 'pair_match',
          read: false,
          data: {
            your_diamond: 'PR002',
            partner_diamond: 'PR003',
            partner_dealer: 'יעקב לוי',
            match_score: 96,
            pair_value_increase: '15-20%'
          },
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'group-demand-1',
          title: '🔥 ביקוש גבוה בקבוצות',
          message: 'זוהה ביקוש גבוה לצורת Oval 0.8-1.2ct בקבוצות הטלגרם. יש לך 3 יהלומים מתאימים.',
          type: 'group_demand',
          read: false,
          data: {
            demand_type: 'Oval',
            carat_range: '0.8-1.2',
            matching_diamonds: ['OV001', 'OV002', 'OV003'],
            groups_count: 5,
            estimated_interest: 'גבוה'
          },
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'price-opportunity-1',
          title: '📈 הזדמנות מחיר',
          message: 'המחיר של יהלומי H VS2 עלה ב-8% השבוע. יש לך 2 יהלומים בקטגוריה הזו.',
          type: 'price_opportunity',
          read: true,
          data: {
            category: 'H VS2',
            price_change: '+8%',
            your_diamonds: ['RD005', 'CU001'],
            market_trend: 'עולה'
          },
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        }
      ];

      setNotifications([...sampleNotifications, ...transformedNotifications]);

      // Show toast for new notifications
      const newNotifications = [...sampleNotifications, ...transformedNotifications].filter(n => !n.read);
      
      if (newNotifications.length > 0) {
        toast({
          title: "🔔 התראות חדשות!",
          description: `יש לך ${newNotifications.length} התראות חדשות על הזדמנות עסקיות`,
        });
      }

    } catch (error) {
      console.warn('Notifications fetch failed, using fallback:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationTitle = (type: string, metadata?: any): string => {
    switch (type) {
      case 'buyer_interest':
        return '💎 קונה מעוניין ביהלום שלך';
      case 'pair_match':
        return '💍 נמצא זוג מושלם';
      case 'group_demand':
        return '🔥 ביקוש גבוה בקבוצות';
      case 'price_opportunity':
        return '📈 הזדמנות מחיר';
      case 'diamond_match':
        const matchCount = metadata?.match_count || 1;
        return `🔍 נמצאו ${matchCount} התאמות לבקשת חיפוש`;
      case 'customer_inquiry':
        return '👤 פנייה חדשה מלקוח';
      case 'wishlist_added':
        return '⭐ יהלום נוסף לרשימת המועדפים';
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
          toast({
            title: "🔔 התראה חדשה!",
            description: "קיבלת התראה חדשה על הזדמנות עסקית",
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
