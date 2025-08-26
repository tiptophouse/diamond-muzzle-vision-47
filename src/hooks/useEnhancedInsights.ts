
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

interface Diamond {
  id?: string;
  shape?: string;
  weight?: number;
  carat?: number;
  price_per_carat?: number;
  owners?: number[];
  owner_id?: number;
}

export function useEnhancedInsights() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchInsights = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('📊 Fetching diamonds data to generate insights...');
      const response = await api.get<Diamond[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.error) {
        throw new Error(response.error);
      }

      const diamonds = response.data || [];
      console.log('📊 Received diamonds data:', diamonds.length, 'items');
      
      // Filter diamonds for current user
      const userDiamonds = diamonds.filter(diamond => 
        diamond.owners?.includes(user.id) || diamond.owner_id === user.id
      );

      console.log('📊 User diamonds after filtering:', userDiamonds.length);

      if (userDiamonds.length === 0) {
        setInsights({
          totalValue: 0,
          averagePrice: 0,
          topShapes: [],
          priceRanges: []
        });
        setIsLoading(false);
        return;
      }

      // Calculate insights from actual data
      const totalValue = userDiamonds.reduce((sum, diamond) => {
        const weight = diamond.weight || diamond.carat || 0;
        const pricePerCarat = diamond.price_per_carat || 0;
        return sum + (weight * pricePerCarat);
      }, 0);

      const averagePrice = totalValue / userDiamonds.length;

      // Calculate top shapes
      const shapeCount = new Map<string, number>();
      userDiamonds.forEach(diamond => {
        if (diamond.shape) {
          shapeCount.set(diamond.shape, (shapeCount.get(diamond.shape) || 0) + 1);
        }
      });

      const topShapes = Array.from(shapeCount.entries())
        .map(([shape, count]) => ({ shape, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate price ranges
      const priceRanges = [
        { range: '$0 - $5,000', count: 0 },
        { range: '$5,001 - $10,000', count: 0 },
        { range: '$10,001 - $25,000', count: 0 },
        { range: '$25,001+', count: 0 }
      ];

      userDiamonds.forEach(diamond => {
        const weight = diamond.weight || diamond.carat || 0;
        const pricePerCarat = diamond.price_per_carat || 0;
        const totalPrice = weight * pricePerCarat;

        if (totalPrice <= 5000) {
          priceRanges[0].count++;
        } else if (totalPrice <= 10000) {
          priceRanges[1].count++;
        } else if (totalPrice <= 25000) {
          priceRanges[2].count++;
        } else {
          priceRanges[3].count++;
        }
      });

      const insightsData: InsightsData = {
        totalValue,
        averagePrice,
        topShapes,
        priceRanges: priceRanges.filter(range => range.count > 0)
      };

      console.log('📊 Generated insights:', insightsData);
      setInsights(insightsData);
      
      toast({
        title: "Insights Updated",
        description: `Analyzed ${userDiamonds.length} diamonds from your inventory.`,
      });

    } catch (error) {
      console.error('❌ Error fetching insights:', error);
      toast({
        title: "Unable to Load Insights",
        description: "Using fallback data while we resolve the connection issue.",
        variant: "destructive",
      });
      
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
