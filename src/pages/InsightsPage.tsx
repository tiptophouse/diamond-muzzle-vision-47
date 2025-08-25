
import React from 'react';
import { EnhancedTelegramLayout } from '@/components/layout/EnhancedTelegramLayout';
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
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

export default function InsightsPage() {
  const { insights, loading, error } = useEnhancedInsights();
  
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
        <InsightsHeader />
        
        <QuickStatsGrid insights={insights} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketComparison insights={insights} />
          <ProfitabilityInsights insights={insights} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryVelocity insights={insights} />
          <ShapeDistributionChart insights={insights} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PersonalInsightsCard insights={insights} />
          <GroupInsightsCard insights={insights} />
          <ShapeAnalysisCard insights={insights} />
          <MarketDemandCard insights={insights} />
        </div>
      </div>
    </UnifiedLayout>
  );
}
