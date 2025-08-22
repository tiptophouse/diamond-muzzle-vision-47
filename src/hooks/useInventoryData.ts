
import { useQuery } from '@tanstack/react-query';
import { Diamond } from '@/types/diamond';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface InventoryResponse {
  diamonds: Diamond[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useInventoryData(page: number = 1, pageSize: number = 20) {
  const { user } = useTelegramAuth();

  const query = useQuery({
    queryKey: ['inventory', page, pageSize, user?.id],
    queryFn: async (): Promise<InventoryResponse> => {
      if (!user?.id) {
        console.log('🛑 No user ID, returning default inventory data');
        return {
          diamonds: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        };
      }

      console.log(`💎 Fetching inventory data from FastAPI for user ${user.id}, page ${page}, page size ${pageSize}...`);
      const response = await api.get(apiEndpoints.getAllDiamonds(user.id), {
        params: {
          page: page,
          page_size: pageSize,
        },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('💎 Inventory data from FastAPI:', response.data);
      return response.data as InventoryResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    data: query.data as InventoryResponse | undefined,
    // Add backward compatibility properties
    allDiamonds: query.data?.diamonds || [],
    diamonds: query.data?.diamonds || [],
    loading: query.isLoading,
    fetchData: query.refetch,
  };
}
