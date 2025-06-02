
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useCurrentUserBlockStatus() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useTelegramAuth();

  const checkBlockStatus = async () => {
    if (!user?.id) {
      setIsBlocked(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('telegram_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking block status:', error);
        setIsBlocked(false);
      } else {
        setIsBlocked(!!data);
      }
    } catch (error) {
      console.error('Error checking block status:', error);
      setIsBlocked(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBlockStatus();
  }, [user?.id]);

  return {
    isBlocked,
    isLoading,
    refetch: checkBlockStatus,
  };
}
