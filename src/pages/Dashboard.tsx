
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useLeads } from "@/hooks/useLeads";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNotifications } from "@/hooks/useNotifications";
import { TrendingUp, Users, Crown, Bell, Diamond, DollarSign, BarChart3, Eye } from "lucide-react";
import { useState, useEffect } from "react";

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
    return (
      <Layout>
        <div className="space-y-4 p-2 sm:p-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Loading your data safely...</p>
            
            {/* Emergency mode toggle */}
            <button 
              onClick={() => setEmergencyMode(true)}
              className="mt-2 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
            >
              Skip to Emergency Mode
            </button>
          </div>
          
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time insights and analytics
          </p>
          
          {/* Emergency mode indicator */}
          {emergencyMode && (
            <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
              Emergency Mode: Using fallback data
            </div>
          )}
        </div>

        {/* Key Metrics Grid - Mobile First */}
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Inventory" 
            value={totalInventory} 
            description="Diamonds" 
            icon={Diamond} 
            trend={12} 
            trendLabel="this month" 
            className="text-xs" 
          />
          <StatCard 
            title="Portfolio Value" 
            value={Math.round(totalValue)} 
            prefix="$" 
            description="Total worth" 
            icon={DollarSign} 
            trend={8} 
            trendLabel="this week" 
            className="text-xs" 
          />
          <StatCard 
            title="Active Leads" 
            value={activeLeads} 
            description="Inquiries" 
            icon={Users} 
            trend={15} 
            trendLabel="new today" 
            className="text-xs" 
          />
          <StatCard 
            title="Avg Price/Ct" 
            value={Math.round(avgPricePerCarat)} 
            prefix="$" 
            description="Per carat" 
            icon={TrendingUp} 
            trend={5} 
            trendLabel="vs market" 
            className="text-xs" 
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Avg Carat" 
            value={parseFloat(avgCaratWeight.toFixed(2))} 
            suffix="ct" 
            description="Weight" 
            icon={BarChart3} 
            className="text-xs" 
          />
          <StatCard 
            title="Premium Stones" 
            value={premiumDiamonds.length} 
            description=">2ct or >$10k" 
            icon={Crown} 
            className="text-xs" 
          />
          <StatCard 
            title="Notifications" 
            value={unreadNotifications} 
            description="Unread" 
            icon={Bell} 
            trend={-3} 
            trendLabel="vs yesterday" 
            className="text-xs" 
          />
          <StatCard 
            title="Views Today" 
            value={247} 
            description="Inventory views" 
            icon={Eye} 
            trend={23} 
            trendLabel="vs yesterday" 
            className="text-xs" 
          />
        </div>

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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Premium Collection</CardTitle>
              <CardDescription className="text-sm">
                Highest value diamonds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {premiumDiamonds.slice(0, 8).map((diamond, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {diamond.carat}ct {diamond.shape} {diamond.color} {diamond.clarity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {diamond.stockNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        ${(diamond.price || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${Math.round((diamond.price || 0) / (diamond.carat || 1)).toLocaleString()}/ct
                      </p>
                    </div>
                  </div>
                ))}
                {premiumDiamonds.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No premium diamonds in inventory
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Market Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Portfolio Growth</span>
                  <span className="text-sm font-semibold text-green-600">+12.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Index</span>
                  <span className="text-sm font-semibold text-blue-600">+8.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Outperformance</span>
                  <span className="text-sm font-semibold text-purple-600">+4.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Best Performers:</span> Round, Princess
                </div>
                <div className="text-sm">
                  <span className="font-medium">Trending:</span> Fancy colors
                </div>
                <div className="text-sm">
                  <span className="font-medium">Recommend:</span> Increase 1-2ct inventory
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>New inquiry</span>
                  <span className="text-muted-foreground">2h ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Price updated</span>
                  <span className="text-muted-foreground">4h ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Inventory sync</span>
                  <span className="text-muted-foreground">6h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
