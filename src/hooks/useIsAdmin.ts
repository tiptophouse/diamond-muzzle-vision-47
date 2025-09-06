import { useState, useEffect } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useTelegramWebApp();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const adminTelegramId = await getAdminTelegramId();
        setIsAdmin(user.id === adminTelegramId);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);

  return { isAdmin, loading };
}