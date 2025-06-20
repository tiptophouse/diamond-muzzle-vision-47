
import { useState, useEffect } from 'react';
import { Diamond } from '@/types/diamond';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useInsightsData() {
  const { user } = useTelegramAuth();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsightsData = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the correct endpoint without type parameter
      const endpoint = apiEndpoints.getAllStones(user.id);
      const response = await api.get(endpoint);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && Array.isArray(response.data)) {
        const transformedDiamonds: Diamond[] = response.data.map((item: any) => ({
          id: item.id || `${item.stock_number}-${Date.now()}`,
          stockNumber: item.stock_number || '',
          shape: item.shape || 'Round',
          carat: Number(item.weight || item.carat) || 0,
          color: item.color || 'D',
          clarity: item.clarity || 'FL',
          cut: item.cut || 'Excellent',
          price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
          status: item.status || 'Available',
          store_visible: item.store_visible !== false,
        }));
        setDiamonds(transformedDiamonds);
      } else {
        setDiamonds([]);
      }
    } catch (err) {
      console.error('Failed to fetch insights data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights data');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, [user?.id]);

  return {
    diamonds,
    loading,
    error,
    refetch: fetchInsightsData,
  };
}
