
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface GroupNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: any;
  created_at: string;
}

export function useGroupNotifications() {
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);
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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('telegram_id', user.id)
        .eq('message_type', 'group_diamond_request')
        .order('sent_at', { ascending: false });

      if (error) throw error;

      const transformedNotifications = (data || []).map(notification => ({
        id: notification.id,
        title: `💎 בקשת יהלום מקבוצה`,
        message: notification.message_content,
        type: notification.message_type,
        read: !!notification.read_at,
        data: notification.metadata,
        created_at: notification.sent_at,
      }));

      setNotifications(transformedNotifications);

      // Show toast for new group notifications
      const newGroupRequests = transformedNotifications.filter(n => !n.read);
      
      if (newGroupRequests.length > 0) {
        toast({
          title: "🔔 בקשת יהלום חדשה מקבוצה!",
          description: `יש לך ${newGroupRequests.length} בקשות חדשות עם התאמות במלאי`,
        });
      }

    } catch (error) {
      console.warn('Group notifications fetch failed:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
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
    }
  };

  // Set up real-time subscription for new group notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('group-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `telegram_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 New group notification received:', payload);
          
          if (payload.new.message_type === 'group_diamond_request') {
            const newNotification = {
              id: payload.new.id,
              title: `💎 בקשת יהלום מקבוצה`,
              message: payload.new.message_content,
              type: payload.new.message_type,
              read: false,
              data: payload.new.metadata,
              created_at: payload.new.sent_at,
            };

            setNotifications(prev => [newNotification, ...prev]);

            // Show real-time toast
            toast({
              title: "🔔 בקשת יהלום חדשה!",
              description: `יש התאמה למלאי שלך מקבוצת B2B`,
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
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  return {
    notifications,
    isLoading,
    markAsRead,
    refetch: fetchNotifications,
  };
}
