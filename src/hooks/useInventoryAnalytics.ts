import { useState, useEffect, useMemo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { supabase } from '@/integrations/supabase/client';

export interface DeadStockAlert {
  diamond: Diamond;
  daysOnMarket: number;
  estimatedLoss: number;
  recommendations: string[];
}

export interface VelocityMetric {
  category: string;
  type: 'shape' | 'color' | 'clarity' | 'carat_range';
  value: string;
  averageDaysToSell: number;
  totalSold: number;
  currentInventory: number;
  velocity: 'fast' | 'medium' | 'slow';
}

export interface DemandForecast {
  shape: string;
  caratRange: string;
  colorGrade: string;
  clarityGrade: string;
  currentDemand: number;
  projectedDemand: number;
  recommendedStock: number;
  profitPotential: number;
}

export interface InventoryAnalytics {
  deadStockAlerts: DeadStockAlert[];
  velocityMetrics: VelocityMetric[];
  demandForecasts: DemandForecast[];
  totalInventoryValue: number;
  deadStockValue: number;
  avgDaysOnMarket: number;
  fastMovingItems: number;
  slowMovingItems: number;
}

const DEAD_STOCK_THRESHOLD = 90; // days
const FAST_VELOCITY_THRESHOLD = 30; // days
const SLOW_VELOCITY_THRESHOLD = 60; // days

export function useInventoryAnalytics(diamonds: Diamond[]) {
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get carat range category
  const getCaratRange = (carat: number): string => {
    if (carat < 0.5) return '0.0-0.49ct';
    if (carat < 1.0) return '0.50-0.99ct';
    if (carat < 2.0) return '1.00-1.99ct';
    if (carat < 3.0) return '2.00-2.99ct';
    return '3.00ct+';
  };

  // Calculate days on market (mock for now, would be based on created_at)
  const getDaysOnMarket = (diamond: Diamond): number => {
    // Mock calculation - in real scenario, use actual created_at from database
    return Math.floor(Math.random() * 180) + 1;
  };

  // Generate dead stock alerts
  const generateDeadStockAlerts = useMemo((): DeadStockAlert[] => {
    return diamonds
      .map(diamond => {
        const daysOnMarket = getDaysOnMarket(diamond);
        if (daysOnMarket < DEAD_STOCK_THRESHOLD) return null;

        const estimatedLoss = Math.floor(diamond.price * 0.01 * Math.max(0, daysOnMarket - DEAD_STOCK_THRESHOLD));
        const recommendations = [];

        if (daysOnMarket > 120) {
          recommendations.push('Consider 15-20% price reduction');
          recommendations.push('Promote in B2B groups');
        }
        if (daysOnMarket > 150) {
          recommendations.push('Offer to wholesale buyers');
          recommendations.push('Bundle with popular items');
        }

        return {
          diamond,
          daysOnMarket,
          estimatedLoss,
          recommendations,
        };
      })
      .filter(Boolean) as DeadStockAlert[];
  }, [diamonds]);

  // Generate velocity metrics
  const generateVelocityMetrics = useMemo((): VelocityMetric[] => {
    const metrics: VelocityMetric[] = [];

    // Group by shape
    const shapeGroups = diamonds.reduce((acc, diamond) => {
      if (!acc[diamond.shape]) acc[diamond.shape] = [];
      acc[diamond.shape].push(diamond);
      return acc;
    }, {} as Record<string, Diamond[]>);

    Object.entries(shapeGroups).forEach(([shape, shapeDiamonds]) => {
      // Mock velocity calculation - in real scenario, would use sales history
      const avgDays = 20 + Math.floor(Math.random() * 80);
      const totalSold = Math.floor(Math.random() * 50);
      
      metrics.push({
        category: shape,
        type: 'shape',
        value: shape,
        averageDaysToSell: avgDays,
        totalSold,
        currentInventory: shapeDiamonds.length,
        velocity: avgDays < FAST_VELOCITY_THRESHOLD ? 'fast' : 
                 avgDays > SLOW_VELOCITY_THRESHOLD ? 'slow' : 'medium',
      });
    });

    // Group by carat range
    const caratGroups = diamonds.reduce((acc, diamond) => {
      const range = getCaratRange(diamond.carat);
      if (!acc[range]) acc[range] = [];
      acc[range].push(diamond);
      return acc;
    }, {} as Record<string, Diamond[]>);

    Object.entries(caratGroups).forEach(([range, caratDiamonds]) => {
      const avgDays = 25 + Math.floor(Math.random() * 70);
      const totalSold = Math.floor(Math.random() * 30);
      
      metrics.push({
        category: range,
        type: 'carat_range',
        value: range,
        averageDaysToSell: avgDays,
        totalSold,
        currentInventory: caratDiamonds.length,
        velocity: avgDays < FAST_VELOCITY_THRESHOLD ? 'fast' : 
                 avgDays > SLOW_VELOCITY_THRESHOLD ? 'slow' : 'medium',
      });
    });

    return metrics.sort((a, b) => a.averageDaysToSell - b.averageDaysToSell);
  }, [diamonds]);

  // Generate demand forecasts
  const generateDemandForecasts = useMemo((): DemandForecast[] => {
    const forecasts: DemandForecast[] = [];
    const popularCombinations = [
      { shape: 'Round', caratRange: '1.00-1.99ct', color: 'G', clarity: 'VS1' },
      { shape: 'Princess', caratRange: '0.50-0.99ct', color: 'F', clarity: 'VS2' },
      { shape: 'Cushion', caratRange: '1.00-1.99ct', color: 'H', clarity: 'SI1' },
      { shape: 'Emerald', caratRange: '2.00-2.99ct', color: 'E', clarity: 'VVS2' },
      { shape: 'Oval', caratRange: '1.00-1.99ct', color: 'G', clarity: 'VS1' },
    ];

    popularCombinations.forEach(combo => {
      const currentDemand = Math.floor(Math.random() * 20) + 5;
      const projectedDemand = Math.floor(currentDemand * (1 + (Math.random() * 0.5 - 0.25)));
      const currentStock = diamonds.filter(d => 
        d.shape === combo.shape && 
        getCaratRange(d.carat) === combo.caratRange &&
        d.color === combo.color &&
        d.clarity === combo.clarity
      ).length;
      
      const recommendedStock = Math.max(projectedDemand, currentStock + 2);
      const profitPotential = (recommendedStock - currentStock) * 500 * Math.random();

      forecasts.push({
        shape: combo.shape,
        caratRange: combo.caratRange,
        colorGrade: combo.color,
        clarityGrade: combo.clarity,
        currentDemand,
        projectedDemand,
        recommendedStock,
        profitPotential,
      });
    });

    return forecasts.sort((a, b) => b.profitPotential - a.profitPotential);
  }, [diamonds]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalValue = diamonds.reduce((sum, d) => sum + d.price, 0);
    const deadStockValue = generateDeadStockAlerts.reduce((sum, alert) => sum + alert.diamond.price, 0);
    const avgDays = diamonds.length > 0 ? 
      diamonds.reduce((sum, d) => sum + getDaysOnMarket(d), 0) / diamonds.length : 0;
    
    const fastMoving = generateVelocityMetrics.filter(m => m.velocity === 'fast').length;
    const slowMoving = generateVelocityMetrics.filter(m => m.velocity === 'slow').length;

    return {
      totalInventoryValue: totalValue,
      deadStockValue,
      avgDaysOnMarket: Math.round(avgDays),
      fastMovingItems: fastMoving,
      slowMovingItems: slowMoving,
    };
  }, [diamonds, generateDeadStockAlerts, generateVelocityMetrics]);

  // Generate analytics when diamonds change
  useEffect(() => {
    if (diamonds.length === 0) {
      setAnalytics(null);
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      setAnalytics({
        deadStockAlerts: generateDeadStockAlerts,
        velocityMetrics: generateVelocityMetrics,
        demandForecasts: generateDemandForecasts,
        ...summaryMetrics,
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [diamonds, generateDeadStockAlerts, generateVelocityMetrics, generateDemandForecasts, summaryMetrics]);

  return {
    analytics,
    loading,
    error,
  };
}