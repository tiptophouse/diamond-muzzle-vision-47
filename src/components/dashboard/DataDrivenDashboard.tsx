
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeBanner } from '@/components/tutorial/WelcomeBanner';
import { Layout } from '@/components/layout/Layout';
import { Gem, Users, TrendingUp, Star, Plus, Upload, PieChart, BarChart3, Scissors, Weight, Eye, DollarSign } from 'lucide-react';
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

  // Enhanced analytics calculations
  const totalCarats = allDiamonds.reduce((sum, d) => sum + d.carat, 0);
  const avgCarat = allDiamonds.length > 0 ? (totalCarats / allDiamonds.length).toFixed(2) : 0;
  
  // Cut distribution
  const cutDistribution = allDiamonds.reduce((acc, diamond) => {
    const cut = diamond.cut || 'Unknown';
    acc[cut] = (acc[cut] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Carat ranges
  const caratRanges = {
    'Under 0.5ct': allDiamonds.filter(d => d.carat < 0.5).length,
    '0.5-1.0ct': allDiamonds.filter(d => d.carat >= 0.5 && d.carat < 1.0).length,
    '1.0-2.0ct': allDiamonds.filter(d => d.carat >= 1.0 && d.carat < 2.0).length,
    '2.0ct+': allDiamonds.filter(d => d.carat >= 2.0).length,
  };

  // Clarity distribution
  const clarityDistribution = allDiamonds.reduce((acc, diamond) => {
    const clarity = diamond.clarity || 'Unknown';
    acc[clarity] = (acc[clarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Price ranges
  const priceRanges = {
    'Under $1K': allDiamonds.filter(d => d.price < 1000).length,
    '$1K-$5K': allDiamonds.filter(d => d.price >= 1000 && d.price < 5000).length,
    '$5K-$10K': allDiamonds.filter(d => d.price >= 5000 && d.price < 10000).length,
    '$10K+': allDiamonds.filter(d => d.price >= 10000).length,
  };

  // Premium stones (high value)
  const premiumStones = allDiamonds.filter(d => 
    (d.color && ['D', 'E', 'F'].includes(d.color)) &&
    (d.clarity && ['FL', 'IF', 'VVS1', 'VVS2'].includes(d.clarity)) &&
    d.carat >= 1.0
  ).length;

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

        {/* Enhanced Analytics Section */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Carats"
            value={Number(totalCarats.toFixed(2))}
            suffix="ct"
            icon={Weight}
            loading={loading}
            description={`${avgCarat}ct average weight`}
          />
          <StatCard
            title="Premium Stones"
            value={premiumStones}
            icon={Star}
            loading={loading}
            description="D-F color, VVS+ clarity, 1ct+"
          />
          <StatCard
            title="Highest Price"
            value={Math.max(...allDiamonds.map(d => d.price), 0)}
            prefix="$"
            icon={DollarSign}
            loading={loading}
            description="Most valuable stone"
          />
          <StatCard
            title="Cut Excellence"
            value={allDiamonds.filter(d => d.cut === 'Excellent').length}
            icon={Scissors}
            loading={loading}
            description={`${((allDiamonds.filter(d => d.cut === 'Excellent').length / allDiamonds.length) * 100).toFixed(1)}% excellent cut`}
          />
        </div>

        {/* Detailed Analytics Charts */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* Cut Distribution */}
          <InventoryChart
            data={Object.entries(cutDistribution).map(([name, value]) => ({ name, value })).filter(item => item.value > 0)}
            title="Cut Distribution"
            loading={loading}
          />
          
          {/* Carat Ranges */}
          <InventoryChart
            data={Object.entries(caratRanges).map(([name, value]) => ({ name, value })).filter(item => item.value > 0)}
            title="Carat Weight Ranges"
            loading={loading}
          />
          
          {/* Clarity Distribution */}
          <InventoryChart
            data={Object.entries(clarityDistribution).map(([name, value]) => ({ name, value })).filter(item => item.value > 0)}
            title="Clarity Distribution"
            loading={loading}
          />
        </div>

        {/* Price Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Analysis
            </CardTitle>
            <CardDescription>Inventory value distribution and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3">Price Ranges</h4>
                <div className="space-y-2">
                  {Object.entries(priceRanges).map(([range, count]) => (
                    <div key={range} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{range}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{count}</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / allDiamonds.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Value Insights</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-800">Total Portfolio Value</span>
                    <span className="font-bold text-green-900">${totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-800">Average Diamond Value</span>
                    <span className="font-bold text-blue-900">${Math.round(totalValue / allDiamonds.length).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-800">Value per Carat</span>
                    <span className="font-bold text-purple-900">${avgPricePerCarat.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Quality Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Quality Overview
            </CardTitle>
            <CardDescription>Quality distribution across your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-3 text-center">Color Grades</h4>
                <div className="space-y-2">
                  {['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map(color => {
                    const count = allDiamonds.filter(d => d.color === color).length;
                    return count > 0 ? (
                      <div key={color} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{color}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{count}</span>
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" 
                              style={{ width: `${(count / allDiamonds.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-center">Clarity Grades</h4>
                <div className="space-y-2">
                  {['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1'].map(clarity => {
                    const count = allDiamonds.filter(d => d.clarity === clarity).length;
                    return count > 0 ? (
                      <div key={clarity} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{clarity}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{count}</span>
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" 
                              style={{ width: `${(count / allDiamonds.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-center">Cut Quality</h4>
                <div className="space-y-2">
                  {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map(cut => {
                    const count = allDiamonds.filter(d => d.cut === cut).length;
                    return count > 0 ? (
                      <div key={cut} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{cut}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{count}</span>
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" 
                              style={{ width: `${(count / allDiamonds.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
