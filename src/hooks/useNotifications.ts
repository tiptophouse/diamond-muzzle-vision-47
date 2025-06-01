
import { useState, useEffect } from 'react';
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
      // For now, use sample data since the table types aren't updated yet
      setNotifications([
        {
          id: '1',
          title: 'Welcome to Diamond Muzzle',
          message: 'Your account has been successfully created.',
          type: 'info',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'New Customer Search Alert',
          message: 'A customer is looking for diamonds matching your inventory.',
          type: 'search_alert',
          read: false,
          created_at: new Date().toISOString(),
        }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state for now
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
