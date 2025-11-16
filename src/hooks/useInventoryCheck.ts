import { useQuery } from '@tanstack/react-query';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

const BACKEND_URL = 'https://brilliant-teat-diamonds-ai-backend.replit.app';
const BEARER_TOKEN = 'reotnrjtoierjtoirjeoitjroeitjreoitjeroijtreoitjeorijteoitjroeitjerotijerotijero';

export function useInventoryCheck() {
  const { user } = useTelegramAuth();

  return useQuery({
    queryKey: ['inventory-check', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { hasStock: false, count: 0 };
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/get_all_stones`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Telegram-User-ID': user.id.toString(),
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch inventory:', response.status);
          return { hasStock: false, count: 0 };
        }

        const data = await response.json();
        const stones = Array.isArray(data) ? data : [];
        
        return {
          hasStock: stones.length > 0,
          count: stones.length,
          stones
        };
      } catch (error) {
        console.error('Error checking inventory:', error);
        return { hasStock: false, count: 0 };
      }
    },
    enabled: !!user?.id,
    refetchOnMount: true,
    staleTime: 30000, // 30 seconds
  });
}