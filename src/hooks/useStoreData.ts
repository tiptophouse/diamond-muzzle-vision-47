
import { useQuery } from '@tanstack/react-query';
import { Diamond } from '@/types/diamond';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface StoreData {
  diamonds: Diamond[];
  total: number;
  page: number;
  totalPages: number;
}

export function useStoreData(page: number = 1, limit: number = 20) {
  const { user } = useTelegramAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['store', page, limit, user?.id],
    queryFn: async (): Promise<StoreData> => {
      if (!user?.id) {
        return {
          diamonds: [],
          total: 0,
          page: 1,
          totalPages: 1,
        };
      }

      console.log('💎 Fetching store data from FastAPI...');
      const response = await api.get(apiEndpoints.getAllStones(user.id));

      if (response.error) {
        throw new Error(response.error);
      }

      const diamonds = Array.isArray(response.data) ? response.data : [];

      return {
        diamonds: diamonds,
        total: diamonds.length,
        page: page,
        totalPages: Math.ceil(diamonds.length / limit),
      };
    },
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    // Add backward compatibility
    diamonds: data?.diamonds || [],
    loading: isLoading,
  };
}
