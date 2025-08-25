
import React from 'react';
import { InsightsHeader } from '@/components/insights/InsightsHeader';
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
import { useInsightsData } from '@/hooks/useInsightsData';

export default function InsightsPage() {
  const { allDiamonds, loading, error, fetchData } = useInventoryData();
  const insights = useEnhancedInsights(allDiamonds);
  const { 
    personalInsights, 
    groupInsights,
    demandInsights,
    marketTrends
  } = useInsightsData();
  
  // Clear any navigation buttons for insights page
  useUnifiedTelegramNavigation();

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error) {
    return (
      <UnifiedLayout>
        <div className="p-4">
          <div className="text-center text-red-600">
            <p>Error loading insights: {error}</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="space-y-6 p-4">
        <InsightsHeader 
          totalDiamonds={allDiamonds.length}
          loading={loading}
          onRefresh={fetchData}
        />
        
        <QuickStatsGrid diamonds={allDiamonds} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketComparison diamonds={allDiamonds} />
          <ProfitabilityInsights diamonds={allDiamonds} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryVelocity diamonds={allDiamonds} />
          <ShapeDistributionChart diamonds={allDiamonds} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PersonalInsightsCard diamonds={allDiamonds} />
          <GroupInsightsCard groupInsights={groupInsights} />
          <ShapeAnalysisCard diamonds={allDiamonds} />
          <MarketDemandCard demandInsights={demandInsights} />
        </div>
      </div>
    </UnifiedLayout>
  );
}
