import { useState, useEffect, useCallback } from 'react';

// Define types for enhanced insights data
interface ProfitabilityInsightsData {
  totalValue: number;
  totalProfit: number;
  profitMargin: number;
  topPerformers: { stockNumber: string; shape: string; pricePerCarat: number; profit: number }[];
  underperformers: { stockNumber: string; shape: string; pricePerCarat: number; profit: number }[];
  categoryBreakdown: { category: string; totalValue: number; count: number; profit: number }[];
}

interface MarketComparisonData {
  yourPosition: {
    avgPricePerCarat: number;
    marketRank: 'competitive' | 'premium' | 'value';
    percentileRank: number;
  };
  shapeComparison: { shape: string; yourAvgPrice: number; marketAvgPrice: number; difference: number; marketShare: number }[];
  competitiveAdvantages: string[];
  recommendations: string[];
}

interface InventoryVelocityData {
  turnoverRate: number;
  avgDaysInStock: number;
  fastMovers: { shape: string; avgDaysToSell: number; volume: number }[];
  slowMovers: { shape: string; avgDaysInStock: number; count: number }[];
  velocityTrend: { month: string; turnoverRate: number; avgDaysToSell: number }[];
}

interface EnhancedInsights {
  profitability: ProfitabilityInsightsData;
  marketComparison: MarketComparisonData;
  inventoryVelocity: InventoryVelocityData;
}

export interface Diamond {
  id: string;
  diamondId?: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  color_type?: 'Fancy' | 'Standard'; // Add this field to differentiate fancy vs standard
  clarity: string;
  cut: string;
  price: number;
  status: string;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  imageUrl?: string;
  gem360Url?: string;
  store_visible: boolean;
  certificateNumber?: string;
  lab?: string;
  certificateUrl?: string;
  // Add CSV-specific fields
  Image?: string; // CSV Image field
  image?: string; // Alternative image field
  picture?: string; // Another possible image field
  'Video link'?: string; // CSV Video link field
  videoLink?: string; // Alternative video link field
}

export function useEnhancedInsights(diamonds: Diamond[]) {
  const [insights, setInsights] = useState<EnhancedInsights>({
    profitability: {
      totalValue: 0,
      totalProfit: 0,
      profitMargin: 0,
      topPerformers: [],
      underperformers: [],
      categoryBreakdown: []
    },
    marketComparison: {
      yourPosition: {
        avgPricePerCarat: 0,
        marketRank: 'competitive' as const,
        percentileRank: 0
      },
      shapeComparison: [],
      competitiveAdvantages: [],
      recommendations: []
    },
    inventoryVelocity: {
      turnoverRate: 0,
      avgDaysInStock: 0,
      fastMovers: [],
      slowMovers: [],
      velocityTrend: []
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateEnhancedInsights = useCallback(async () => {
    if (!diamonds?.length) {
      setInsights({
        profitability: {
          totalValue: 0,
          totalProfit: 0,
          profitMargin: 0,
          topPerformers: [],
          underperformers: [],
          categoryBreakdown: []
        },
        marketComparison: {
          yourPosition: {
            avgPricePerCarat: 0,
            marketRank: 'competitive' as const,
            percentileRank: 0
          },
          shapeComparison: [],
          competitiveAdvantages: [],
          recommendations: []
        },
        inventoryVelocity: {
          turnoverRate: 0,
          avgDaysInStock: 0,
          fastMovers: [],
          slowMovers: [],
          velocityTrend: []
        }
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate profitability insights
      const totalValue = diamonds.reduce((sum, d) => sum + (d.price || 0), 0);
      const estimatedProfit = totalValue * 0.25; // 25% margin estimate
      
      const profitabilityData = {
        totalValue,
        totalProfit: estimatedProfit,
        profitMargin: totalValue > 0 ? (estimatedProfit / totalValue) * 100 : 0,
        topPerformers: diamonds
          .filter(d => d.price && d.carat)
          .map(d => ({
            stockNumber: d.stockNumber,
            shape: d.shape,
            pricePerCarat: (d.price || 0) / (d.carat || 1),
            profit: (d.price || 0) * 0.25
          }))
          .sort((a, b) => b.pricePerCarat - a.pricePerCarat)
          .slice(0, 5),
        underperformers: diamonds
          .filter(d => d.price && d.carat)
          .map(d => ({
            stockNumber: d.stockNumber,
            shape: d.shape,
            pricePerCarat: (d.price || 0) / (d.carat || 1),
            profit: (d.price || 0) * 0.15
          }))
          .sort((a, b) => a.pricePerCarat - b.pricePerCarat)
          .slice(0, 5),
        categoryBreakdown: Object.entries(
          diamonds.reduce((acc, d) => {
            const shape = d.shape || 'Unknown';
            if (!acc[shape]) acc[shape] = { totalValue: 0, count: 0, profit: 0 };
            acc[shape].totalValue += d.price || 0;
            acc[shape].count += 1;
            acc[shape].profit += (d.price || 0) * 0.25;
            return acc;
          }, {} as Record<string, any>)
        ).map(([shape, data]) => ({
          category: shape,
          ...data
        }))
      };

      // Calculate market comparison
      const averagePricePerCarat = diamonds.length > 0 
        ? diamonds.reduce((sum, d) => sum + ((d.price || 0) / (d.carat || 1)), 0) / diamonds.length
        : 0;

      const shapeStats = Object.entries(
        diamonds.reduce((acc, d) => {
          const shape = d.shape || 'Unknown';
          if (!acc[shape]) acc[shape] = { prices: [], count: 0 };
          acc[shape].prices.push((d.price || 0) / (d.carat || 1));
          acc[shape].count += 1;
          return acc;
        }, {} as Record<string, any>)
      ).map(([shape, data]) => ({
        shape,
        yourAvgPrice: data.prices.reduce((sum: number, p: number) => sum + p, 0) / data.prices.length,
        marketAvgPrice: data.prices.reduce((sum: number, p: number) => sum + p, 0) / data.prices.length * 1.1, // Mock market average
        difference: 0,
        marketShare: (data.count / diamonds.length) * 100
      }));

      const marketComparisonData = {
        yourPosition: {
          avgPricePerCarat: averagePricePerCarat,
          marketRank: 'competitive' as const,
          percentileRank: 65
        },
        shapeComparison: shapeStats.map(item => ({
          ...item,
          difference: item.yourAvgPrice - item.marketAvgPrice
        })),
        competitiveAdvantages: [
          "Strong round diamond selection",
          "Competitive pricing on premium stones",
          "Diverse shape portfolio"
        ],
        recommendations: [
          "Focus on expanding fancy shapes inventory",
          "Consider premium stone acquisition",
          "Optimize pricing for market positioning"
        ]
      };

      // Calculate inventory velocity
      const avgDaysInStock = 45; // Mock data for now
      const turnoverRate = 365 / avgDaysInStock;

      const shapeVelocity = Object.entries(
        diamonds.reduce((acc, d) => {
          const shape = d.shape || 'Unknown';
          if (!acc[shape]) acc[shape] = { count: 0, totalDays: 0 };
          acc[shape].count += 1;
          acc[shape].totalDays += avgDaysInStock; // Mock data
          return acc;
        }, {} as Record<string, any>)
      );

      const inventoryVelocityData = {
        turnoverRate,
        avgDaysInStock,
        fastMovers: shapeVelocity
          .map(([shape, data]) => ({
            shape,
            avgDaysToSell: data.totalDays / data.count,
            volume: data.count
          }))
          .sort((a, b) => a.avgDaysToSell - b.avgDaysToSell)
          .slice(0, 3),
        slowMovers: shapeVelocity
          .map(([shape, data]) => ({
            shape,
            avgDaysInStock: data.totalDays / data.count,
            count: data.count
          }))
          .sort((a, b) => b.avgDaysInStock - a.avgDaysInStock)
          .slice(0, 3),
        velocityTrend: [
          { month: 'Jan', turnoverRate: 6.2, avgDaysToSell: 42 },
          { month: 'Feb', turnoverRate: 6.8, avgDaysToSell: 38 },
          { month: 'Mar', turnoverRate: 7.1, avgDaysToSell: 36 },
          { month: 'Apr', turnoverRate: 6.9, avgDaysToSell: 39 },
          { month: 'May', turnoverRate: 7.3, avgDaysToSell: 35 },
          { month: 'Jun', turnoverRate: 7.5, avgDaysToSell: 33 }
        ]
      };

      setInsights({
        profitability: profitabilityData,
        marketComparison: marketComparisonData,
        inventoryVelocity: inventoryVelocityData
      });

    } catch (error) {
      console.error('Error calculating enhanced insights:', error);
      setError('Failed to calculate insights');
    } finally {
      setIsLoading(false);
    }
  }, [diamonds]);

  useEffect(() => {
    calculateEnhancedInsights();
  }, [calculateEnhancedInsights]);

  const refetch = useCallback(() => {
    return calculateEnhancedInsights();
  }, [calculateEnhancedInsights]);

  return {
    insights,
    isLoading,
    error,
    refetch
  };
}
