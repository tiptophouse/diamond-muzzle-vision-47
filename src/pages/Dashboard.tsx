
import { Layout } from "@/components/layout/Layout";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useLeads } from "@/hooks/useLeads";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNotifications } from "@/hooks/useNotifications";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { PremiumCollection } from "@/components/dashboard/PremiumCollection";
import { MarketInsights } from "@/components/dashboard/MarketInsights";

export default function Dashboard() {
  // Get inventory data from the hook
  const {
    allDiamonds = [],
    loading: inventoryLoading = false,
    handleRefresh
  } = useInventoryData();
  
  const {
    leads = [],
    isLoading: leadsLoading = false
  } = useLeads();
  
  const {
    subscriptions = [],
    isLoading: subscriptionsLoading = false
  } = useSubscriptions();
  
  const {
    notifications = []
  } = useNotifications();

  // Calculate metrics with real data
  const totalInventory = allDiamonds?.length || 0;
  const activeLeads = leads?.filter(lead => lead.status === 'active').length || 0;
  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  // Calculate portfolio metrics
  const totalValue = allDiamonds?.reduce((sum, diamond) => sum + (diamond.price || 0), 0) || 0;
  const avgCaratWeight = allDiamonds?.length > 0 ? 
    allDiamonds.reduce((sum, d) => sum + (d.carat || 0), 0) / allDiamonds.length : 0;
  const avgPricePerCarat = allDiamonds?.length > 0 ? 
    allDiamonds.reduce((sum, d) => sum + (d.price || 0) / (d.carat || 1), 0) / allDiamonds.length : 0;

  // Shape distribution for chart
  const shapeData = allDiamonds?.reduce((acc, diamond) => {
    const shape = diamond.shape || 'Unknown';
    acc[shape] = (acc[shape] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const chartData = Object.entries(shapeData).map(([name, value]) => ({
    name,
    value: Number(value),
    color: '#7a63f5'
  }));

  // Premium diamonds (>2ct or >$10k)
  const premiumDiamonds = allDiamonds?.filter(d => (d.carat || 0) > 2 || (d.price || 0) > 10000) || [];

  console.log('Dashboard - Total diamonds:', totalInventory);
  console.log('Dashboard - Chart data:', chartData);

  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        <DashboardHeader emergencyMode={false} />

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
                Your inventory breakdown ({totalInventory} diamonds)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryChart data={chartData} title="" loading={inventoryLoading} />
            </CardContent>
          </Card>

          <PremiumCollection premiumDiamonds={premiumDiamonds} />
        </div>

        <MarketInsights />

        {/* Debug info when no data */}
        {!inventoryLoading && totalInventory === 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-800">
                No diamonds found in your inventory. Check the console for API logs or try refreshing.
              </p>
              <button 
                onClick={handleRefresh} 
                className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300"
              >
                Refresh Data
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
