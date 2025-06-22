
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
          
          <Card className="text-center py-12">
            <CardHeader>
              <Gem className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Welcome to Diamond Muzzle! 💎</CardTitle>
              <CardDescription className="text-lg">
                Your diamond inventory management system is ready to go
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Get started by adding diamonds to your inventory using one of the methods below:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/upload')} 
                  className="flex items-center gap-2"
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
              
              <div className="mt-8 text-sm text-gray-500">
                <p>💡 <strong>Tip:</strong> You can upload a CSV file with multiple diamonds or add them one by one</p>
                <p>📊 Your dashboard will show analytics once you have inventory data</p>
              </div>
            </CardContent>
          </Card>
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
          />
          <StatCard
            title="Available"
            value={availableDiamonds}
            icon={Users}
            loading={loading}
          />
          <StatCard
            title="Store Visible"
            value={storeVisibleDiamonds}
            icon={TrendingUp}
            loading={loading}
          />
          <StatCard
            title="Avg Price/Ct"
            value={avgPricePerCarat}
            icon={Star}
            loading={loading}
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
