
import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Welcome!',
          message: 'Welcome to mazal-bot diamond trading platform',
          type: 'info',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Inventory Updated',
          message: 'Your inventory has been successfully updated',
          type: 'success',
          read: true,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 600);
  }, [isAuthenticated, user]);

  return {
    notifications,
    isLoading,
  };
}
