import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { Diamond } from '@/types/diamond';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface Insight {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export function useEnhancedInsights() {
  const { user } = useTelegramAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(apiEndpoints.getUserInsights(user.id));
      if (response.error) {
        throw new Error(response.error);
      }
      setInsights(response.data as Insight[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user?.id]);

  return {
    insights,
    isLoading,
    error,
    refetch: fetchInsights,
  };
}
