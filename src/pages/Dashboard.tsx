
import { Layout } from "@/components/layout/Layout";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useLeads } from "@/hooks/useLeads";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KeyMetricsGrid } from "@/components/dashboard/KeyMetricsGrid";
import { SecondaryMetricsGrid } from "@/components/dashboard/SecondaryMetricsGrid";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { MarketInsightsSection } from "@/components/dashboard/MarketInsightsSection";
import { DashboardLoadingState } from "@/components/dashboard/DashboardLoadingState";

export default function Dashboard() {
  const [enableDataFetching, setEnableDataFetching] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // Always use hooks, but handle emergency mode in the data processing
  const inventoryResult = useInventoryData();
  const leadsResult = useLeads();
  const subscriptionsResult = useSubscriptions();
  const notificationsResult = useNotifications();

  // Use actual data or fallback based on mode
  const {
    allDiamonds = [],
    loading: inventoryLoading = false
  } = emergencyMode ? { allDiamonds: [], loading: false } : inventoryResult;
  
  const {
    leads = [],
    isLoading: leadsLoading = false
  } = emergencyMode ? { leads: [], isLoading: false } : leadsResult;
  
  const {
    subscriptions = [],
    isLoading: subscriptionsLoading = false
  } = emergencyMode ? { subscriptions: [], isLoading: false } : subscriptionsResult;
  
  const {
    notifications = []
  } = emergencyMode ? { notifications: [] } : notificationsResult;

  // Auto-enable emergency mode if any hook fails
  useEffect(() => {
    const hasErrors = !enableDataFetching || 
      (inventoryLoading && leadsLoading && subscriptionsLoading);
    
    if (hasErrors) {
      setEmergencyMode(true);
    }
  }, [inventoryLoading, leadsLoading, subscriptionsLoading, enableDataFetching]);

  // Calculate metrics with safe fallbacks
  const totalInventory = allDiamonds?.length || 0;
  const activeLeads = leads?.filter(lead => lead.status === 'active').length || 0;
  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  // Safe calculations
  const totalValue = allDiamonds?.reduce((sum, diamond) => sum + (diamond.price || 0), 0) || 0;
  const avgCaratWeight = allDiamonds?.length > 0 ? 
    allDiamonds.reduce((sum, d) => sum + (d.carat || 0), 0) / allDiamonds.length : 0;
  const avgPricePerCarat = allDiamonds?.length > 0 ? 
    allDiamonds.reduce((sum, d) => sum + (d.price || 0) / (d.carat || 1), 0) / allDiamonds.length : 0;

  // Safe shape distribution with proper type checking
  const shapeData = allDiamonds?.reduce((acc, diamond) => {
    const shape = diamond.shape || 'Unknown';
    acc[shape] = (acc[shape] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const chartData = Object.entries(shapeData).map(([name, value]) => ({
    name,
    value: Number(value), // Ensure value is a number
    color: '#7a63f5'
  }));

  // Premium diamonds calculation
  const premiumDiamonds = allDiamonds?.filter(d => (d.carat || 0) > 2 || (d.price || 0) > 10000) || [];

  // Show emergency loading state if needed
  if (!emergencyMode && (inventoryLoading || leadsLoading || subscriptionsLoading)) {
    return <DashboardLoadingState onEmergencyMode={() => setEmergencyMode(true)} />;
  }

  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        <DashboardHeader 
          emergencyMode={emergencyMode}
          onEmergencyMode={() => setEmergencyMode(true)}
        />

        <KeyMetricsGrid
          totalInventory={totalInventory}
          totalValue={totalValue}
          activeLeads={activeLeads}
          avgPricePerCarat={avgPricePerCarat}
        />

        <SecondaryMetricsGrid
          avgCaratWeight={avgCaratWeight}
          premiumDiamondsCount={premiumDiamonds.length}
          unreadNotifications={unreadNotifications}
        />

        <ChartsSection
          chartData={chartData}
          premiumDiamonds={premiumDiamonds}
          inventoryLoading={inventoryLoading}
        />

        <MarketInsightsSection />
      </div>
    </Layout>
  );
}
