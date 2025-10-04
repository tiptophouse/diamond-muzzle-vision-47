import { useState, useEffect } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { isAdminTelegramId } from '@/lib/secureAdmin';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useTelegramWebApp();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        console.log('🔍 useIsAdmin: No user ID found');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 useIsAdmin: Checking admin status for Telegram ID:', user.id);
        const adminStatus = await isAdminTelegramId(user.id);
        console.log('🔍 useIsAdmin: Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('❌ useIsAdmin: Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);

  return { isAdmin, loading };
}