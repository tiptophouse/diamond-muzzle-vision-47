import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserCountry {
  telegram_id: number;
  country_code: string | null;
  country_name: string | null;
}

export function useUsersCountry(telegramIds: number[]) {
  const [data, setData] = useState<Record<number, UserCountry>>({});
  const [loading, setLoading] = useState(false);

  const ids = useMemo(() => Array.from(new Set(telegramIds.filter(Boolean))), [telegramIds]);

  useEffect(() => {
    if (!ids.length) return;
    let cancelled = false;
    setLoading(true);

    supabase.functions
      .invoke('get-users-country', { body: { telegram_ids: ids } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('get-users-country error', error);
          setData({});
          return;
        }
        const map: Record<number, UserCountry> = {};
        for (const r of data?.results || []) {
          map[r.telegram_id] = r;
        }
        setData(map);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [ids.join(',')]);

  return { countries: data, loading };
}
