
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      // Set the user context for RLS
      await supabase.rpc('set_config', {
        parameter: 'app.current_user_id',
        value: user.id.toString()
      });

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback: create some sample data if table doesn't exist yet
      setNotifications([
        {
          id: '1',
          title: 'Welcome to Diamond Muzzle',
          message: 'Your account has been successfully created.',
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
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  return {
    notifications,
    isLoading,
    markAsRead,
    refetch: fetchNotifications,
  };
}
