import { useState, useEffect } from 'react';
import { isAdminTelegramId } from '@/lib/secureAdmin';

interface SecureAdminCheckProps {
  telegramId: number | undefined;
  children: (isAdmin: boolean, loading: boolean) => React.ReactNode;
}

/**
 * Secure admin verification component that checks against database
 * instead of relying on hardcoded values
 */
export function SecureAdminCheck({ telegramId, children }: SecureAdminCheckProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!telegramId) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await isAdminTelegramId(telegramId);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [telegramId]);

  return <>{children(isAdmin, loading)}</>;
}