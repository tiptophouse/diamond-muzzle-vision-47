import { useQuery } from '@tanstack/react-query';
import { api, apiEndpoints } from '@/lib/api';
import { Diamond } from '@/types/diamond';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface ReportData {
  totalDiamonds: number;
  totalValue: number;
  averagePrice: number;
  diamondsByClarity: { [clarity: string]: number };
  diamondsByColor: { [color: string]: number };
  diamondsByShape: { [shape: string]: number };
}

export function useReportsData() {
  const { user } = useTelegramAuth();

  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      try {
        console.log('📊 Fetching reports data from FastAPI...');
        const response = await api.get(apiEndpoints.getReports(user.id));
        
        if (response.error) {
          throw new Error(response.error);
        }

        return response.data as ReportData;
      } catch (error) {
        console.error('❌ Error fetching reports data:', error);
        return null;
      }
    },
    enabled: !!user?.id,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    reports,
    isLoading,
    error,
    refetch,
  };
}
