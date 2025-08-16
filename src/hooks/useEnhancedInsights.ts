
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
  marketComparison?: {
    yourPosition: {
      rank: number;
      percentile: number;
      competitiveAdvantage: string[];
    };
    benchmarks: {
      averagePrice: number;
      pricePosition: 'above' | 'at' | 'below';
      qualityScore: number;
    };
  };
}

export function useEnhancedInsights(diamonds: Diamond[]) {
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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!diamonds?.length) return;

    setLoading(true);

    setTimeout(() => {
      const enhancedInsights = generateEnhancedInsights(diamonds);
      setInsights(enhancedInsights);
      setLoading(false);
    }, 800);
  }, [diamonds]);

  return { insights, loading };
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
      avgPrice: items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length
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
        volume: shape.count
      })),
      slowMovers: topShapes.slice(-2).map(shape => ({
        shape: shape.shape,
        avgDaysToSell: 60 + Math.floor(Math.random() * 40),
        volume: shape.count
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
        avgPrice: averagePricePerCarat,
        margin: 15 + Math.random() * 20,
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
      })),
      underperformingStones: topShapes.slice(-2).map(shape => ({
        shape: shape.shape,
        daysInInventory: 60 + Math.floor(Math.random() * 40),
        priceAdjustmentSuggestion: -5 - Math.random() * 10
      }))
    };

    enhancedInsights.marketComparison = {
      yourPosition: {
        rank: Math.floor(Math.random() * 100) + 1,
        percentile: 75 + Math.floor(Math.random() * 20),
        competitiveAdvantage: [
          'Premium certification standards',
          'Competitive pricing strategy',
          'Diverse inventory selection'
        ]
      },
      benchmarks: {
        averagePrice: averagePricePerCarat * (0.9 + Math.random() * 0.2),
        pricePosition: averagePricePerCarat > 5000 ? 'above' : averagePricePerCarat > 3000 ? 'at' : 'below',
        qualityScore: 8.2 + Math.random() * 1.5
      }
    };
  }

  return enhancedInsights;
}
