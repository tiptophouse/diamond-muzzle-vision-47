
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserLogin {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  last_login: string;
  login_count: number;
  first_login: string;
}

interface DetailedUserLogin {
  id: string;
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium: boolean;
  photo_url?: string;
  login_timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export function useUserLogins() {
  const [userLogins, setUserLogins] = useState<UserLogin[]>([]);
  const [detailedLogins, setDetailedLogins] = useState<DetailedUserLogin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserLogins = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch aggregated login data from the view
      const { data: aggregatedData, error: aggregatedError } = await supabase
        .from('recent_user_logins')
        .select('*')
        .order('last_login', { ascending: false });

      if (aggregatedError) {
        throw aggregatedError;
      }

      setUserLogins(aggregatedData || []);

      // Fetch detailed recent logins (last 50)
      const { data: detailedData, error: detailedError } = await supabase
        .from('user_logins')
        .select('*')
        .order('login_timestamp', { ascending: false })
        .limit(50);

      if (detailedError) {
        throw detailedError;
      }

      setDetailedLogins(detailedData || []);

    } catch (err) {
      console.error('❌ Error fetching user logins:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user logins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLogins();
  }, []);

  const refreshLogins = () => {
    fetchUserLogins();
  };

  return {
    userLogins,
    detailedLogins,
    isLoading,
    error,
    refreshLogins
  };
}
