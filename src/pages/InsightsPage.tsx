
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
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

export default function InsightsPage() {
  const { allDiamonds, loading, error, fetchData } = useInventoryData();
  const insights = useEnhancedInsights(allDiamonds);
  
  // Clear any navigation buttons for insights page
  useUnifiedTelegramNavigation();

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
          <QuickStatsGrid data={allDiamonds} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketComparison data={allDiamonds} />
          <ProfitabilityInsights data={allDiamonds} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryVelocity data={allDiamonds} />
          <ShapeDistributionChart data={allDiamonds} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PersonalInsightsCard data={allDiamonds} />
          <GroupInsightsCard data={allDiamonds} />
          <ShapeAnalysisCard data={allDiamonds} />
          <MarketDemandCard data={allDiamonds} />
        </div>
      </div>
    </UnifiedLayout>
  );
}
