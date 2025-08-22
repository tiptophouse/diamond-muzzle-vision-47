
import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface InsightsData {
  totalValue: number;
  averagePrice: number;
  topShapes: Array<{ shape: string; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
}

export function useEnhancedInsights() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchInsights = async () => {
    if (!user?.id) return;
    
    try {
      console.log('📊 Fetching insights from FastAPI...');
      const response = await api.get(apiEndpoints.getUserInsights(user.id));
      
      if (response.error) {
        throw new Error(response.error);
      }

      setInsights(response.data as InsightsData);
    } catch (error) {
      console.error('❌ Error fetching insights:', error);
      // Fallback data
      setInsights({
        totalValue: 0,
        averagePrice: 0,
        topShapes: [],
        priceRanges: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInsights();
    }
  }, [user?.id]);

  return {
    insights,
    isLoading,
    refetch: fetchInsights,
  };
}
