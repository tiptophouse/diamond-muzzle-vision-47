
import { Layout } from "@/components/layout/Layout";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useLeads } from "@/hooks/useLeads";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { PremiumCollection } from "@/components/dashboard/PremiumCollection";
import { MarketInsights } from "@/components/dashboard/MarketInsights";

export default function Dashboard() {
  const [enableDataFetching, setEnableDataFetching] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // Only use hooks if data fetching is enabled
  const inventoryHook = useInventoryData();
  const leadsHook = useLeads();
  const subscriptionsHook = useSubscriptions();
  const notificationsHook = useNotifications();

  // Fallback data for emergency mode with proper loading states
  const fallbackData = {
    allDiamonds: [],
    leads: [],
    subscriptions: [],
    notifications: [],
    loading: false,
    isLoading: false,
  };

  // Use actual data or fallback based on mode with proper destructuring
  const {
    allDiamonds = [],
    loading: inventoryLoading = false
  } = emergencyMode ? fallbackData : inventoryHook;
  
  const {
    leads = [],
    isLoading: leadsLoading = false
  } = emergencyMode ? fallbackData : leadsHook;
  
  const {
    subscriptions = [],
    isLoading: subscriptionsLoading = false
  } = emergencyMode ? fallbackData : subscriptionsHook;
  
  const {
    notifications = []
  } = emergencyMode ? fallbackData : notificationsHook;

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

  // Safe shape distribution with proper number typing
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
    return <DashboardLoading onEmergencyMode={() => setEmergencyMode(true)} />;
  }

  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        <DashboardHeader emergencyMode={emergencyMode} />

        <MetricsGrid
          totalInventory={totalInventory}
          totalValue={totalValue}
          activeLeads={activeLeads}
          avgPricePerCarat={avgPricePerCarat}
          avgCaratWeight={avgCaratWeight}
          premiumDiamondsCount={premiumDiamonds.length}
          unreadNotifications={unreadNotifications}
        />

        {/* Charts and Detailed Info */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Shape Distribution</CardTitle>
              <CardDescription className="text-sm">
                Your inventory breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryChart data={chartData} title="" loading={inventoryLoading} />
            </CardContent>
          </Card>

          <PremiumCollection premiumDiamonds={premiumDiamonds} />
        </div>

        <MarketInsights />
      </div>
    </Layout>
  );
}
