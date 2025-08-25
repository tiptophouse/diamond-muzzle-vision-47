
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickStatsGrid } from '@/components/insights/QuickStatsGrid';
import { MarketComparison } from '@/components/insights/MarketComparison';
import { ProfitabilityInsights } from '@/components/insights/ProfitabilityInsights';
import { InventoryVelocity } from '@/components/insights/InventoryVelocity';
import { ShapeDistributionChart } from '@/components/insights/ShapeDistributionChart';
import { PersonalInsightsCard } from '@/components/insights/PersonalInsightsCard';
import { GroupInsightsCard } from '@/components/insights/GroupInsightsCard';
import { ShapeAnalysisCard } from '@/components/insights/ShapeAnalysisCard';
import { MarketDemandCard } from '@/components/insights/MarketDemandCard';
import { useEnhancedInsights } from '@/hooks/useEnhancedInsights';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInsightsData } from '@/hooks/useInsightsData';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

export default function InsightsPage() {
  const { allDiamonds, loading: inventoryLoading, error: inventoryError, fetchData } = useInventoryData();
  const insights = useEnhancedInsights(allDiamonds);
  const insightsData = useInsightsData();
  
  // Clear any navigation buttons for insights page
  useUnifiedTelegramNavigation();

  const loading = inventoryLoading || insightsData.loading;
  const error = inventoryError;

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="space-y-6 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error) {
    return (
      <UnifiedLayout>
        <div className="p-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">Error loading insights: {error}</p>
            </CardContent>
          </Card>
        </div>
      </UnifiedLayout>
    );
  }

  // Transform data for components that expect different structures
  const quickStatsData = {
    totalDiamonds: allDiamonds.length,
    totalValue: insights.totalValue,
    averagePrice: insights.averagePrice,
    topShape: insights.topShapes[0]?.shape || 'Round'
  };

  const marketComparisonData = {
    yourPosition: 'Above Average',
    shapeComparison: insights.topShapes.map(shape => ({
      shape: shape.shape,
      yourCount: shape.count,
      marketAverage: shape.count * 0.8,
      percentage: (shape.count / insights.totalCount) * 100
    })),
    competitiveAdvantages: ['Premium Selection', 'Competitive Pricing'],
    recommendations: ['Focus on popular shapes', 'Optimize pricing strategy']
  };

  const profitabilityData = {
    totalInventoryValue: insights.totalValue,
    averageMargin: insights.profitMargin,
    topPerformingShapes: insights.topShapes.slice(0, 3).map(shape => ({
      shape: shape.shape,
      margin: 0.25,
      revenue: shape.value
    })),
    underperformingStones: insights.topShapes.slice(-2).map(shape => ({
      stockNumber: `Sample-${shape.shape}`,
      shape: shape.shape,
      daysInInventory: 120,
      suggestedAction: 'Price reduction'
    }))
  };

  const velocityData = {
    turnoverRate: insights.inventoryVelocity,
    avgTimeToSell: 45,
    fastMovers: insights.topShapes.slice(0, 3).map(shape => ({
      shape: shape.shape,
      avgDays: 30
    })),
    slowMovers: insights.topShapes.slice(-2).map(shape => ({
      shape: shape.shape,
      avgDays: 90
    })),
    seasonalTrends: [],
    recommendations: ['Focus on fast-moving shapes']
  };

  const shapeDistributionData = {
    distribution: insights.shapeDistribution.map(item => ({
      shape: item.shape,
      count: item.count,
      percentage: item.percentage
    }))
  };

  return (
    <UnifiedLayout>
      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Insights</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for your diamond inventory
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStatsGrid {...quickStatsData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketComparison data={marketComparisonData} />
          <ProfitabilityInsights data={profitabilityData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryVelocity data={velocityData} />
          <ShapeDistributionChart data={shapeDistributionData} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PersonalInsightsCard insights={insightsData.personalInsights} />
          <GroupInsightsCard insights={insightsData.groupInsights} />
          <ShapeAnalysisCard trends={insightsData.marketTrends} />
          <MarketDemandCard demands={insightsData.demandInsights} />
        </div>
      </div>
    </UnifiedLayout>
  );
}
