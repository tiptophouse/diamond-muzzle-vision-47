import { useMemo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';

interface ROIMetrics {
  totalInvestment: number;
  projectedRevenue: number;
  profitMargin: number;
  breakEvenTime: number; // months
  monthlyROI: number;
  yearlyROI: number;
  riskScore: number; // 0-100, lower is better
  recommendations: string[];
}

export function useROICalculator(diamonds: Diamond[]) {
  const metrics = useMemo((): ROIMetrics => {
    if (!diamonds || diamonds.length === 0) {
      return {
        totalInvestment: 0,
        projectedRevenue: 0,
        profitMargin: 0,
        breakEvenTime: 0,
        monthlyROI: 0,
        yearlyROI: 0,
        riskScore: 100,
        recommendations: ['Upload your diamond inventory to see ROI analysis']
      };
    }

    // Calculate total investment (current inventory value) from actual data
    const totalInvestment = diamonds.reduce((sum, d) => sum + (d.price || 0), 0);
    
    // Industry-standard calculations
    const averageMargin = 0.25; // 25% margin typical in diamond industry
    const monthlyTurnoverRate = 0.12; // 12% monthly turnover
    const seasonalMultiplier = 1.15; // 15% boost during peak seasons
    
    // Calculate projected revenue
    const monthlyRevenue = totalInvestment * monthlyTurnoverRate;
    const projectedRevenue = monthlyRevenue * 12 * seasonalMultiplier;
    const profit = projectedRevenue * averageMargin;
    
    // Calculate ROI metrics
    const monthlyROI = (monthlyRevenue * averageMargin / totalInvestment) * 100;
    const yearlyROI = (profit / totalInvestment) * 100;
    const breakEvenTime = totalInvestment / (monthlyRevenue * averageMargin);
    
    // Risk assessment based on actual diamond prices
    const priceDistribution = diamonds.map(d => d.price || 0).sort((a, b) => b - a);
    const highValueCount = priceDistribution.filter(p => p > 10000).length;
    const diversificationScore = new Set(diamonds.map(d => d.shape)).size / Math.min(diamonds.length, 10);
    const concentrationRisk = (highValueCount / diamonds.length) * 100;
    
    // Risk score calculation (0-100, lower is better)
    let riskScore = 50; // Base risk
    riskScore += Math.min(concentrationRisk * 0.5, 25); // Concentration risk (max 25 points)
    riskScore -= diversificationScore * 5; // Diversification benefit (max -25 points)
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (monthlyROI < 2) {
      recommendations.push('Consider increasing prices or focusing on higher-margin diamonds');
    }
    if (concentrationRisk > 50) {
      recommendations.push('Diversify your inventory to reduce concentration risk');
    }
    if (breakEvenTime > 8) {
      recommendations.push('Improve inventory turnover through better marketing and pricing');
    }
    if (yearlyROI > 30) {
      recommendations.push('Strong performance! Consider expanding inventory in top-performing categories');
    }
    if (diversificationScore < 0.5) {
      recommendations.push('Add more diamond shapes to appeal to broader customer base');
    }

    return {
      totalInvestment,
      projectedRevenue,
      profitMargin: averageMargin * 100,
      breakEvenTime,
      monthlyROI,
      yearlyROI,
      riskScore,
      recommendations: recommendations.length > 0 ? recommendations : ['Your portfolio is well-optimized for current market conditions']
    };
  }, [diamonds]);

  return metrics;
}