
import { useState, useEffect } from 'react';
import { Diamond } from "@/components/inventory/InventoryTable";

interface InventoryVelocityData {
  newThisMonth: number;
  soldThisMonth: number;
  netChange: number;
  turnoverRate: number;
  avgTimeToSell: number;
  fastMovers: Array<{ shape: string; avgDaysToSell: number; volume: number }>;
  slowMovers: Array<{ shape: string; avgDaysToSell: number; volume: number }>;
  seasonalTrends: Array<{ month: string; velocity: number }>;
  velocityTrend: 'up' | 'down' | 'stable';
  agingBreakdown: Array<{ ageRange: string; count: number; percentage: number }>;
}

interface ProfitabilityData {
  totalInventoryValue: number;
  averageMargin: number;
  topPerformingShapes: Array<{
    shape: string;
    avgPrice: number;
    margin: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  underperformingStones: Array<{
    shape: string;
    daysInInventory: number;
    priceAdjustmentSuggestion: number;
  }>;
}

interface MarketComparisonData {
  yourPosition: {
    avgPricePerCarat: number;
    marketRank: 'value' | 'premium' | 'competitive';
    percentileRank: number;
  };
  benchmarks: {
    averagePrice: number;
    pricePosition: 'above' | 'at' | 'below';
    qualityScore: number;
  };
  shapeComparison: Array<{
    shape: string;
    yourAvgPrice: number;
    marketAvgPrice: number;
    position: 'above' | 'at' | 'below';
  }>;
  competitiveAdvantages: string[];
  recommendations: string[];
}

interface EnhancedInsights {
  inventoryVelocity: InventoryVelocityData;
  profitabilityMetrics: {
    totalCost: number;
    totalRevenue: number;
    netProfit: number;
    profitMargin: number;
    averagePricePerCarat: number;
    topPerformingShapes: Array<{ shape: string; count: number; avgPrice: number }>;
    marketDemand: 'high' | 'medium' | 'low';
    seasonalInsights: string;
    demandTrends: Array<{ period: string; demand: number }>;
  };
  profitability?: ProfitabilityData;
  marketComparison?: MarketComparisonData;
}

export function useEnhancedInsights(diamonds?: Diamond[]) {
  const [insights, setInsights] = useState<EnhancedInsights>({
    inventoryVelocity: {
      newThisMonth: 0,
      soldThisMonth: 0,
      netChange: 0,
      turnoverRate: 0,
      avgTimeToSell: 0,
      fastMovers: [],
      slowMovers: [],
      seasonalTrends: [],
      velocityTrend: 'stable',
      agingBreakdown: []
    },
    profitabilityMetrics: {
      totalCost: 0,
      totalRevenue: 0,
      netProfit: 0,
      profitMargin: 0,
      averagePricePerCarat: 0,
      topPerformingShapes: [],
      marketDemand: 'medium',
      seasonalInsights: '',
      demandTrends: []
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    if (!diamonds?.length) return Promise.resolve();

    setIsLoading(true);
    setError(null);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          const enhancedInsights = generateEnhancedInsights(diamonds);
          setInsights(enhancedInsights);
          setError(null);
        } catch (err) {
          setError('Failed to generate insights');
        } finally {
          setIsLoading(false);
          resolve();
        }
      }, 800);
    });
  };

  useEffect(() => {
    if (!diamonds?.length) return;

    setIsLoading(true);

    setTimeout(() => {
      try {
        const enhancedInsights = generateEnhancedInsights(diamonds);
        setInsights(enhancedInsights);
        setError(null);
      } catch (err) {
        setError('Failed to generate insights');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  }, [diamonds]);

  return { 
    insights, 
    isLoading, 
    error, 
    refetch,
    loading: isLoading // For backward compatibility
  };
}

function generateEnhancedInsights(diamonds: Diamond[]): EnhancedInsights {
  if (!diamonds?.length) {
    return {
      inventoryVelocity: {
        newThisMonth: 0,
        soldThisMonth: 0,
        netChange: 0,
        turnoverRate: 0,
        avgTimeToSell: 0,
        fastMovers: [],
        slowMovers: [],
        seasonalTrends: [],
        velocityTrend: 'stable',
        agingBreakdown: []
      },
      profitabilityMetrics: {
        totalCost: 0,
        totalRevenue: 0,
        netProfit: 0,
        profitMargin: 0,
        averagePricePerCarat: 0,
        topPerformingShapes: [],
        marketDemand: 'medium',
        seasonalInsights: '',
        demandTrends: []
      }
    };
  }

  const totalDiamonds = diamonds.length;
  const totalInventoryValue = diamonds.reduce((sum, d) => sum + (d.price || 0), 0);
  const averagePricePerCarat = totalInventoryValue / totalDiamonds;
  
  // Calculate costs and profits (mock data for demonstration)
  const totalCost = totalInventoryValue * 0.7; // 70% cost assumption
  const totalRevenue = totalInventoryValue * 1.2; // 120% revenue assumption
  const netProfit = totalRevenue - totalCost;
  const profitMargin = ((netProfit / totalRevenue) * 100);

  // Group by shapes
  const shapeGroups = diamonds.reduce((acc, diamond) => {
    const shape = diamond.shape || 'Unknown';
    if (!acc[shape]) {
      acc[shape] = [];
    }
    acc[shape].push(diamond);
    return acc;
  }, {} as Record<string, Diamond[]>);

  const topShapes = Object.entries(shapeGroups)
    .map(([shape, items]) => ({
      shape,
      count: items.length,
      avgPrice: items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length,
      volume: items.length
    }))
    .sort((a, b) => b.count - a.count);

  const enhancedInsights: EnhancedInsights = {
    inventoryVelocity: {
      newThisMonth: Math.floor(totalDiamonds * 0.15),
      soldThisMonth: Math.floor(totalDiamonds * 0.08),
      netChange: Math.floor(totalDiamonds * 0.07),
      turnoverRate: 12.5,
      avgTimeToSell: 45,
      fastMovers: topShapes.slice(0, 3).map(shape => ({
        shape: shape.shape,
        avgDaysToSell: 15 + Math.floor(Math.random() * 20),
        volume: shape.volume
      })),
      slowMovers: topShapes.slice(-2).map(shape => ({
        shape: shape.shape,
        avgDaysToSell: 60 + Math.floor(Math.random() * 40),
        volume: shape.volume
      })),
      seasonalTrends: [
        { month: 'Jan', velocity: 65 },
        { month: 'Feb', velocity: 72 },
        { month: 'Mar', velocity: 78 },
        { month: 'Apr', velocity: 88 },
        { month: 'May', velocity: 95 }
      ],
      velocityTrend: 'up' as const,
      agingBreakdown: [
        { ageRange: '0-30 days', count: Math.floor(totalDiamonds * 0.4), percentage: 40 },
        { ageRange: '31-90 days', count: Math.floor(totalDiamonds * 0.35), percentage: 35 },
        { ageRange: '91+ days', count: Math.floor(totalDiamonds * 0.25), percentage: 25 }
      ]
    },
    profitabilityMetrics: {
      totalCost,
      totalRevenue,
      netProfit,
      profitMargin,
      averagePricePerCarat,
      topPerformingShapes: topShapes,
      marketDemand: totalDiamonds > 50 ? 'high' : totalDiamonds > 20 ? 'medium' : 'low',
      seasonalInsights: 'Spring season showing increased demand for engagement rings',
      demandTrends: [
        { period: 'Q1', demand: 78 },
        { period: 'Q2', demand: 85 },
        { period: 'Q3', demand: 92 },
        { period: 'Q4', demand: 88 }
      ]
    }
  };

  // Add optional enhanced data if there's enough data
  if (totalDiamonds > 5) {
    enhancedInsights.profitability = {
      totalInventoryValue,
      averageMargin: profitMargin,
      topPerformingShapes: topShapes.slice(0, 3).map(shape => ({
        shape: shape.shape,
        avgPrice: shape.avgPrice,
        margin: 15 + Math.random() * 20,
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
      })),
      underperformingStones: topShapes.slice(-2).map(shape => ({
        shape: shape.shape,
        daysInInventory: 60 + Math.floor(Math.random() * 40),
        priceAdjustmentSuggestion: -5 - Math.random() * 10
      }))
    };

    const marketRank: 'value' | 'premium' | 'competitive' = 
      averagePricePerCarat > 5000 ? 'premium' : 
      averagePricePerCarat > 3000 ? 'competitive' : 'value';

    enhancedInsights.marketComparison = {
      yourPosition: {
        avgPricePerCarat,
        marketRank,
        percentileRank: 75 + Math.floor(Math.random() * 20)
      },
      benchmarks: {
        averagePrice: averagePricePerCarat * (0.9 + Math.random() * 0.2),
        pricePosition: averagePricePerCarat > 5000 ? 'above' : averagePricePerCarat > 3000 ? 'at' : 'below',
        qualityScore: 8.2 + Math.random() * 1.5
      },
      shapeComparison: topShapes.slice(0, 5).map(shape => ({
        shape: shape.shape,
        yourAvgPrice: shape.avgPrice,
        marketAvgPrice: shape.avgPrice * (0.9 + Math.random() * 0.2),
        position: Math.random() > 0.5 ? 'above' : 'below' as 'above' | 'below'
      })),
      competitiveAdvantages: [
        'Superior diamond quality standards',
        'Competitive pricing model',
        'Extensive inventory variety'
      ],
      recommendations: [
        'Focus on fast-moving shapes for better turnover',
        'Consider price adjustments for slow-moving inventory',
        'Leverage seasonal trends for marketing'
      ]
    };
  }

  return enhancedInsights;
}
