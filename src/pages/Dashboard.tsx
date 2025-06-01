
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useLeads } from "@/hooks/useLeads";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNotifications } from "@/hooks/useNotifications";
import { TrendingUp, Users, Crown, Bell, Diamond, DollarSign, BarChart3, Eye } from "lucide-react";

export default function Dashboard() {
  const { allDiamonds, loading: inventoryLoading } = useInventoryData();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();
  const { notifications } = useNotifications();

  // Calculate comprehensive metrics using correct property names
  const totalInventory = allDiamonds.length;
  const activeLeads = leads.filter(lead => lead.status === 'active').length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Advanced calculations using correct Diamond interface properties
  const totalValue = allDiamonds.reduce((sum, diamond) => sum + ((diamond.pricePerCarat || 0) * (diamond.carat || 0)), 0);
  const avgCaratWeight = allDiamonds.length > 0 ? allDiamonds.reduce((sum, d) => sum + (d.carat || 0), 0) / allDiamonds.length : 0;
  const avgPricePerCarat = allDiamonds.length > 0 ? allDiamonds.reduce((sum, d) => sum + (d.pricePerCarat || 0), 0) / allDiamonds.length : 0;
  
  // Shape distribution for chart
  const shapeData = allDiamonds.reduce((acc, diamond) => {
    const shape = diamond.shape || 'Unknown';
    acc[shape] = (acc[shape] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(shapeData).map(([name, value]) => ({
    name,
    value,
    color: '#7a63f5'
  }));

  // Premium diamonds (>2ct or >$10k/ct) using correct property names
  const premiumDiamonds = allDiamonds.filter(d => (d.carat || 0) > 2 || (d.pricePerCarat || 0) > 10000);

  if (inventoryLoading || leadsLoading || subscriptionsLoading) {
    return (
      <Layout>
        <div className="space-y-4 p-2 sm:p-4">
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Diamond Portfolio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time insights and analytics
          </p>
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
            description=">2ct or >$10k/ct"
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
              <InventoryChart 
                data={chartData}
                title=""
                loading={inventoryLoading}
              />
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
                        ${((diamond.pricePerCarat || 0) * (diamond.carat || 0)).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(diamond.pricePerCarat || 0).toLocaleString()}/ct
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
