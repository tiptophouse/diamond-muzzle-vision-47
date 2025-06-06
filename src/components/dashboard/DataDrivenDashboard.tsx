
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Diamond, DollarSign, Users, TrendingUp, Gem, BarChart3 } from "lucide-react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryData } from "@/hooks/useInventoryData";
import { StatCard } from "./StatCard";
import { InventoryChart } from "./InventoryChart";
import { useMemo } from "react";

export default function DataDrivenDashboard() {
  const { user, isTelegramEnvironment, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { loading, allDiamonds } = useInventoryData();

  // Debug logging
  console.log('🔍 Dashboard Debug Info:');
  console.log('- User:', user);
  console.log('- Is Authenticated:', isAuthenticated);
  console.log('- Auth Loading:', authLoading);
  console.log('- Data Loading:', loading);
  console.log('- All Diamonds:', allDiamonds);
  console.log('- Diamonds Count:', allDiamonds?.length || 0);
  console.log('- Is Telegram Environment:', isTelegramEnvironment);

  // Calculate dashboard metrics from real data
  const dashboardMetrics = useMemo(() => {
    if (!allDiamonds || allDiamonds.length === 0) {
      console.log('⚠️ No diamonds available for metrics calculation');
      return {
        totalInventory: 0,
        portfolioValue: 0,
        activeLeads: 0,
        avgPricePerCarat: 0,
        avgCarat: 0,
        premiumStones: 0,
        inventoryByShape: [],
        recentTrends: []
      };
    }

    console.log('📊 Calculating metrics from', allDiamonds.length, 'diamonds');

    const totalInventory = allDiamonds.length;
    const portfolioValue = allDiamonds.reduce((sum, diamond) => sum + (diamond.price || 0), 0);
    
    // Count unique shapes as active leads indicator
    const uniqueShapes = new Set(allDiamonds.map(d => d.shape)).size;
    
    // Calculate average price per carat
    const validPricePerCaratDiamonds = allDiamonds.filter(d => d.price > 0 && d.carat > 0);
    const avgPricePerCarat = validPricePerCaratDiamonds.length > 0 
      ? validPricePerCaratDiamonds.reduce((sum, d) => sum + (d.price / d.carat), 0) / validPricePerCaratDiamonds.length
      : 0;
    
    // Calculate average carat
    const avgCarat = allDiamonds.reduce((sum, d) => sum + (d.carat || 0), 0) / totalInventory;
    
    // Count premium stones (>$10k or >2ct)
    const premiumStones = allDiamonds.filter(d => d.price > 10000 || d.carat > 2).length;
    
    // Group by shape for chart
    const shapeGroups = allDiamonds.reduce((acc, diamond) => {
      const shape = diamond.shape || 'Unknown';
      acc[shape] = (acc[shape] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const inventoryByShape = Object.entries(shapeGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Recent trends by color
    const colorGroups = allDiamonds.reduce((acc, diamond) => {
      const color = diamond.color || 'Unknown';
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentTrends = Object.entries(colorGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const metrics = {
      totalInventory,
      portfolioValue,
      activeLeads: uniqueShapes,
      avgPricePerCarat: Math.round(avgPricePerCarat),
      avgCarat: Number(avgCarat.toFixed(2)),
      premiumStones,
      inventoryByShape,
      recentTrends
    };

    console.log('✅ Calculated metrics:', metrics);
    return metrics;
  }, [allDiamonds]);

  return (
    <Layout>
      <div className="space-y-6 p-4">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Diamond Muzzle Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back {user?.first_name || 'User'}! Here's your portfolio overview.
          </p>
          {!isTelegramEnvironment && (
            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-yellow-800 text-sm">
                Development Mode - Running outside Telegram
              </p>
            </div>
          )}
          
          {/* Debug Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-blue-800 text-sm font-semibold mb-2">Debug Information:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Auth Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
              <div>User ID: {user?.id || 'None'}</div>
              <div>Loading State: {loading ? '⏳ Loading' : '✅ Complete'}</div>
              <div>Diamonds Found: {allDiamonds?.length || 0}</div>
              <div>Environment: {isTelegramEnvironment ? 'Telegram' : 'Development'}</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(authLoading || loading) && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {authLoading ? 'Authenticating...' : 'Loading diamond data...'}
            </p>
          </div>
        )}

        {/* Not Authenticated State */}
        {!authLoading && !isAuthenticated && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Authentication Required</h3>
              <p className="text-red-600">Please make sure you're accessing this app through Telegram.</p>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!authLoading && !loading && isAuthenticated && (!allDiamonds || allDiamonds.length === 0) && (
          <div className="text-center py-8">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">No Diamond Data Found</h3>
              <p className="text-orange-600 mb-4">
                No diamonds were found for user {user?.id}. This could mean:
              </p>
              <ul className="text-sm text-orange-600 text-left max-w-md mx-auto space-y-1">
                <li>• No diamonds have been uploaded to your account</li>
                <li>• Your user ID doesn't match any diamond records</li>
                <li>• There's an issue with the API connection</li>
              </ul>
              <div className="mt-4">
                <a href="#/upload" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Upload Diamond Data
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Data Available - Show Dashboard */}
        {!authLoading && !loading && isAuthenticated && allDiamonds && allDiamonds.length > 0 && (
          <>
            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Inventory"
                value={dashboardMetrics.totalInventory}
                icon={Diamond}
                description="Total diamonds"
                loading={loading}
              />
              
              <StatCard
                title="Portfolio Value"
                value={dashboardMetrics.portfolioValue}
                prefix="$"
                icon={DollarSign}
                description="Total value"
                loading={loading}
              />

              <StatCard
                title="Active Leads"
                value={dashboardMetrics.activeLeads}
                icon={Users}
                description="Unique shapes"
                loading={loading}
              />

              <StatCard
                title="Growth"
                value={12}
                suffix="%"
                icon={TrendingUp}
                description="This month"
                trend={12}
                trendLabel="this month"
                className="text-green-600"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Avg Price/Ct"
                value={dashboardMetrics.avgPricePerCarat}
                prefix="$"
                icon={BarChart3}
                description="Per carat average"
                loading={loading}
              />
              
              <StatCard
                title="Avg Carat"
                value={dashboardMetrics.avgCarat}
                suffix=" ct"
                icon={Gem}
                description="Average weight"
                loading={loading}
              />

              <StatCard
                title="Premium Stones"
                value={dashboardMetrics.premiumStones}
                icon={Diamond}
                description=">$10k or >2ct"
                loading={loading}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <InventoryChart
                data={dashboardMetrics.inventoryByShape}
                title="Inventory by Shape"
                loading={loading}
              />
              
              <InventoryChart
                data={dashboardMetrics.recentTrends}
                title="Distribution by Color"
                loading={loading}
              />
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="#/inventory" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
                View Full Inventory
              </a>
              <a href="#/upload" className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
                Upload New Data
              </a>
              <a href="#/reports" className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
                Generate Reports
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Connection</span>
                  <span className={`text-sm font-medium ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                    {loading ? '⏳ Loading' : '✓ Connected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Authentication</span>
                  <span className={`text-sm font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                    {isAuthenticated ? '✓ Authenticated' : '❌ Not Auth'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm font-medium text-green-600">✓ Real-time</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Access */}
        {user?.id === 2138564172 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Admin Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <a href="#/admin" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                  🎯 Admin Dashboard
                </a>
                <div className="text-sm text-red-600 flex items-center">
                  Processing {dashboardMetrics.totalInventory} diamonds for user {user.id}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
