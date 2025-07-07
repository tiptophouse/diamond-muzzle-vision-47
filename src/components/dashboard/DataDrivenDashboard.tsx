
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeBanner } from '@/components/tutorial/WelcomeBanner';
import { Layout } from '@/components/layout/Layout';
import { Gem, Users, TrendingUp, Star, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useNavigate } from 'react-router-dom';

interface DataDrivenDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export function DataDrivenDashboard({ allDiamonds, loading, fetchData }: DataDrivenDashboardProps) {
  const { user } = useTelegramAuth();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const navigate = useNavigate();

  console.log('🔍 DataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', allDiamonds.length);

  // Listen for inventory changes and refresh dashboard data immediately
  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      console.log('🔄 Dashboard: Inventory changed detected, refreshing dashboard data...');
      fetchData();
    });

    return unsubscribe;
  }, [subscribeToInventoryChanges, fetchData]);

  // Process the data only if we have diamonds
  const { stats, inventoryByShape, salesByCategory } = allDiamonds.length > 0 
    ? processDiamondDataForDashboard(
        allDiamonds.map(d => ({
          id: parseInt(d.id || '0'),
          shape: d.shape,
          color: d.color,
          clarity: d.clarity,
          weight: d.carat,
          price_per_carat: d.price / d.carat,
          owners: [user?.id || 0],
        })),
        user?.id
      )
    : { 
        stats: { 
          totalDiamonds: 0, 
          matchedPairs: 0, 
          totalLeads: 0, 
          activeSubscriptions: 0 
        }, 
        inventoryByShape: [], 
        salesByCategory: [] 
      };

  // Calculate actual metrics from real data
  const totalValue = allDiamonds.reduce((sum, diamond) => sum + diamond.price, 0);
  const availableDiamonds = allDiamonds.filter(d => d.status === 'Available').length;
  const storeVisibleDiamonds = allDiamonds.filter(d => d.store_visible).length;
  const avgPricePerCarat = allDiamonds.length > 0 
    ? Math.round(totalValue / allDiamonds.reduce((sum, d) => sum + d.carat, 0))
    : 0;

  // Show empty state when no diamonds
  if (!loading && allDiamonds.length === 0) {
    return (
      <Layout>
        <div className="space-y-6 p-2 sm:p-4">
          <WelcomeBanner />
          <DashboardHeader emergencyMode={false} />
          
          <div className="premium-card text-center py-16 animate-scale-in">
            <div className="space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Gem className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">✨</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-shift">
                  Welcome to Diamond Muzzle
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                  Your premium diamond inventory management platform
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-subtle"></div>
                  <span>System Ready • Secure • Fast</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4">
                <p className="text-foreground font-medium">
                  Get started by adding diamonds to your inventory:
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/upload')} 
                    className="flex items-center gap-2 premium-button"
                    size="lg"
                  >
                    <Upload className="h-5 w-5" />
                    Upload CSV File
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/upload')} 
                    variant="outline"
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Plus className="h-5 w-5" />
                    Add Single Diamond
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                  <span><strong>Smart Import:</strong> Upload CSV files with automatic mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                  <span><strong>Real-time Analytics:</strong> Dashboard updates instantly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-2 sm:p-4">
        <WelcomeBanner />
        <DashboardHeader emergencyMode={false} />
        
        {/* Real Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Diamonds"
            value={allDiamonds.length}
            icon={Gem}
            loading={loading}
            description={`$${totalValue.toLocaleString()} total value`}
          />
          <StatCard
            title="Available"
            value={availableDiamonds}
            icon={Users}
            loading={loading}
            description={`${((availableDiamonds / allDiamonds.length) * 100).toFixed(1)}% of inventory`}
          />
          <StatCard
            title="Store Visible"
            value={storeVisibleDiamonds}
            icon={TrendingUp}
            loading={loading}
            description={`${((storeVisibleDiamonds / allDiamonds.length) * 100).toFixed(1)}% visible`}
          />
          <StatCard
            title="Avg Price/Ct"
            value={avgPricePerCarat}
            prefix="$"
            icon={Star}
            loading={loading}
            description="Per carat average"
          />
        </div>

        {/* Charts with Real Data */}
        <div className="grid gap-6 lg:grid-cols-2">
          <InventoryChart
            data={inventoryByShape.length > 0 ? inventoryByShape : [
              { name: 'Round', value: allDiamonds.filter(d => d.shape === 'Round').length },
              { name: 'Princess', value: allDiamonds.filter(d => d.shape === 'Princess').length },
              { name: 'Emerald', value: allDiamonds.filter(d => d.shape === 'Emerald').length },
              { name: 'Oval', value: allDiamonds.filter(d => d.shape === 'Oval').length },
              { name: 'Other', value: allDiamonds.filter(d => !['Round', 'Princess', 'Emerald', 'Oval'].includes(d.shape)).length }
            ].filter(item => item.value > 0)}
            title="Inventory by Shape"
            loading={loading}
          />
          <InventoryChart
            data={salesByCategory.length > 0 ? salesByCategory : [
              { name: 'D-F', value: allDiamonds.filter(d => ['D', 'E', 'F'].includes(d.color)).length },
              { name: 'G-H', value: allDiamonds.filter(d => ['G', 'H'].includes(d.color)).length },
              { name: 'I-J', value: allDiamonds.filter(d => ['I', 'J'].includes(d.color)).length },
              { name: 'K+', value: allDiamonds.filter(d => !['D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(d.color)).length }
            ].filter(item => item.value > 0)}
            title="Distribution by Color Grade"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your inventory efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/inventory')} variant="outline">
                <Gem className="h-4 w-4 mr-2" />
                View All Inventory
              </Button>
              <Button onClick={() => navigate('/upload')} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload More Diamonds
              </Button>
              <Button onClick={() => navigate('/store')} variant="outline">
                <Star className="h-4 w-4 mr-2" />
                View Store
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Source Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                Showing data from {allDiamonds.length > 5 ? 'your uploaded inventory' : 'sample diamonds'}
                {allDiamonds.length <= 5 && ' - Upload your CSV file to see real data'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
