
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from '@/lib/api';

interface InsightData {
  totalPrice?: number;
  count?: number;
  shape?: string;
  weight?: number;
  color?: string;
  clarity?: string;
  totalValue?: number;
  totalDiamonds?: number;
}

interface EnhancedInsights {
  totalInventoryValue: number;
  totalDiamonds: number;
  averagePricePerCarat: number;
  topShapes: Array<{ shape: string; count: number; percentage: number }>;
  priceDistribution: Array<{ range: string; count: number; value: number }>;
  inventoryVelocity: {
    newThisMonth: number;
    soldThisMonth: number;
    netChange: number;
  };
  profitabilityMetrics: {
    totalCost: number;
    totalRevenue: number;
    netProfit: number;
    profitMargin: number;
  };
  marketInsights: {
    averageMarketPrice: number;
    pricePerformance: number;
    demandTrends: Array<{ period: string; demand: number }>;
  };
}

export function useEnhancedInsights() {
  const [insights, setInsights] = useState<EnhancedInsights>({
    totalInventoryValue: 0,
    totalDiamonds: 0,
    averagePricePerCarat: 0,
    topShapes: [],
    priceDistribution: [],
    inventoryVelocity: {
      newThisMonth: 0,
      soldThisMonth: 0,
      netChange: 0
    },
    profitabilityMetrics: {
      totalCost: 0,
      totalRevenue: 0,
      netProfit: 0,
      profitMargin: 0
    },
    marketInsights: {
      averageMarketPrice: 0,
      pricePerformance: 0,
      demandTrends: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnhancedInsights = async () => {
    try {
      setIsLoading(true);
      const userId = getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Fetch inventory data
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (inventoryError) throw inventoryError;

      const diamonds = inventory || [];
      
      // Calculate basic metrics
      const totalDiamonds = diamonds.length;
      const totalInventoryValue = diamonds.reduce((sum, diamond) => {
        const price = (diamond.price_per_carat || 0) * (diamond.weight || 0);
        return sum + price;
      }, 0);
      
      const averagePricePerCarat = totalDiamonds > 0 
        ? diamonds.reduce((sum, d) => sum + (d.price_per_carat || 0), 0) / totalDiamonds 
        : 0;

      // Calculate shape distribution
      const shapeCount = diamonds.reduce((acc, diamond) => {
        const shape = diamond.shape || 'Unknown';
        acc[shape] = (acc[shape] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topShapes = Object.entries(shapeCount)
        .map(([shape, count]) => ({
          shape,
          count,
          percentage: Math.round((count / totalDiamonds) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate price distribution
      const priceRanges = [
        { range: '$0-1K', min: 0, max: 1000 },
        { range: '$1K-5K', min: 1000, max: 5000 },
        { range: '$5K-10K', min: 5000, max: 10000 },
        { range: '$10K+', min: 10000, max: Infinity }
      ];

      const priceDistribution = priceRanges.map(range => {
        const diamondsInRange = diamonds.filter(d => {
          const price = (d.price_per_carat || 0) * (d.weight || 0);
          return price >= range.min && price < range.max;
        });
        
        return {
          range: range.range,
          count: diamondsInRange.length,
          value: diamondsInRange.reduce((sum, d) => {
            return sum + ((d.price_per_carat || 0) * (d.weight || 0));
          }, 0)
        };
      });

      // Calculate velocity metrics (mock data for now)
      const newThisMonth = Math.floor(totalDiamonds * 0.1);
      const soldThisMonth = Math.floor(totalDiamonds * 0.05);
      
      // Mock profitability metrics
      const totalCost = totalInventoryValue * 0.7;
      const totalRevenue = totalInventoryValue * 0.2;
      const netProfit = totalRevenue - (totalCost * 0.2);
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      setInsights({
        totalInventoryValue,
        totalDiamonds,
        averagePricePerCarat,
        topShapes,
        priceDistribution,
        inventoryVelocity: {
          newThisMonth,
          soldThisMonth,
          netChange: newThisMonth - soldThisMonth
        },
        profitabilityMetrics: {
          totalCost,
          totalRevenue,
          netProfit,
          profitMargin
        },
        marketInsights: {
          averageMarketPrice: averagePricePerCarat * 1.1,
          pricePerformance: Math.random() * 20 - 10, // Mock performance
          demandTrends: [
            { period: 'Jan', demand: 85 },
            { period: 'Feb', demand: 92 },
            { period: 'Mar', demand: 78 },
            { period: 'Apr', demand: 88 },
            { period: 'May', demand: 95 }
          ]
        }
      });

    } catch (err: any) {
      console.error('Error fetching enhanced insights:', err);
      setError(err.message || 'Failed to fetch insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnhancedInsights();
  }, []);

  const refetch = () => {
    fetchEnhancedInsights();
  };

  return {
    insights,
    isLoading,
    error,
    refetch
  };
}
