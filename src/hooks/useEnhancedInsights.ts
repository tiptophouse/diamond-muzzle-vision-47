
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface InsightsData {
  marketTrends: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  totalDiamonds: number;
  profitabilityInsights: Array<{
    shape: string;
    avgPrice: number;
    profitMargin: number;
  }>;
}

export function useEnhancedInsights() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useTelegramAuth();
  const [insights, setInsights] = useState<InsightsData>({
    marketTrends: [],
    totalDiamonds: 0,
    profitabilityInsights: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    if (!user || !isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Fetching enhanced insights for user:', user.id);
      
      // Get user's diamonds
      const response = await api.get(apiEndpoints.getAllStones(user.id));
      
      // Add type checking for response.data
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const diamonds = response.data.filter((d: any) => 
          d.owners?.includes(user.id) || d.owner_id === user.id
        );
        
        // Calculate market trends by shape
        const shapeMap = new Map<string, number>();
        diamonds.forEach((diamond: any) => {
          if (diamond.shape) {
            shapeMap.set(diamond.shape, (shapeMap.get(diamond.shape) || 0) + 1);
          }
        });
        
        const marketTrends = Array.from(shapeMap.entries())
          .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / diamonds.length) * 100)
          }))
          .sort((a, b) => b.count - a.count);

        // Calculate profitability insights
        const profitabilityInsights = marketTrends.slice(0, 5).map(trend => {
          const shapeDiamonds = diamonds.filter((d: any) => d.shape === trend.category);
          const avgPrice = shapeDiamonds.reduce((sum: number, d: any) => sum + (d.price_per_carat || 0), 0) / shapeDiamonds.length;
          
          return {
            shape: trend.category,
            avgPrice,
            profitMargin: Math.random() * 20 + 5 // Mock profit margin for now
          };
        });

        setInsights({
          marketTrends,
          totalDiamonds: diamonds.length,
          profitabilityInsights
        });

        toast({
          title: "Insights loaded",
          description: `Analyzed ${diamonds.length} diamonds from your inventory.`,
        });
      } else {
        setInsights({
          marketTrends: [],
          totalDiamonds: 0,
          profitabilityInsights: []
        });
        
        toast({
          title: "No diamonds found",
          description: "Upload your inventory to see insights.",
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch insights", err);
      setError(err.message || 'Failed to load insights');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load insights. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchInsights();
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchInsights();
    }
  }, [isAuthenticated, user]);

  return {
    insights,
    loading,
    error,
    refetch,
    isAuthenticated
  };
}
