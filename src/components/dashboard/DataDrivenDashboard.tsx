
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserLoginTracking } from '@/hooks/useUserLoginTracking';
import { useDashboardData } from '@/hooks/useDashboardData';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeBanner } from '@/components/tutorial/WelcomeBanner';
import { UserLoginsSection } from '@/components/dashboard/UserLoginsSection';
import { Layout } from '@/components/layout/Layout';
import { Gem, Users, TrendingUp, Star, Plus, Upload, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const { stats, isLoading: dashboardLoading, connectionHealth, refetch } = useDashboardData();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const navigate = useNavigate();

  // Track user logins automatically when dashboard loads
  useUserLoginTracking();

  console.log('🔍 DataDrivenDashboard: FastAPI connection status:', connectionHealth);
  console.log('🔍 DataDrivenDashboard: Real stats from FastAPI:', stats);

  // Listen for inventory changes and refresh dashboard data immediately
  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      console.log('🔄 Dashboard: Inventory changed detected, refreshing dashboard data...');
      fetchData();
      refetch();
    });

    return unsubscribe;
  }, [subscribeToInventoryChanges, fetchData, refetch]);

  // Use FastAPI stats when available, fallback to calculated stats
  const displayStats = stats || {
    totalInventory: allDiamonds.length,
    totalValue: allDiamonds.reduce((sum, diamond) => sum + diamond.price, 0),
    availableDiamonds: allDiamonds.filter(d => d.status === 'Available').length,
    storeVisibleDiamonds: allDiamonds.filter(d => d.store_visible).length,
    avgPricePerCarat: allDiamonds.length > 0 
      ? Math.round(allDiamonds.reduce((sum, diamond) => sum + diamond.price, 0) / allDiamonds.reduce((sum, d) => sum + d.carat, 0))
      : 0
  };

  const isDataLoading = loading || dashboardLoading;

  // Connection status indicator
  const ConnectionStatus = () => (
    <Alert className={`mb-4 ${connectionHealth === 'healthy' ? 'border-green-200 bg-green-50' : connectionHealth === 'unhealthy' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <div className="flex items-center gap-2">
        {connectionHealth === 'healthy' ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : connectionHealth === 'unhealthy' ? (
          <WifiOff className="h-4 w-4 text-red-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        )}
        <AlertDescription className={connectionHealth === 'healthy' ? 'text-green-800' : connectionHealth === 'unhealthy' ? 'text-red-800' : 'text-yellow-800'}>
          {connectionHealth === 'healthy' && 'Connected to FastAPI - Showing real diamond data'}
          {connectionHealth === 'unhealthy' && 'FastAPI connection failed - Using fallback data'}
          {connectionHealth === 'testing' && 'Testing FastAPI connection...'}
        </AlertDescription>
      </div>
    </Alert>
  );

  // Show empty state when no diamonds and connection is healthy
  if (!isDataLoading && displayStats.totalInventory === 0 && connectionHealth === 'healthy') {
    return (
      <Layout>
        <div className="space-y-6 p-2 sm:p-4">
          <WelcomeBanner />
          <DashboardHeader emergencyMode={false} />
          <ConnectionStatus />
          
          {/* User Login Tracking */}
          <UserLoginsSection />
          
          <Card className="text-center py-12">
            <CardHeader>
              <Gem className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">FastAPI Connected! 💎</CardTitle>
              <CardDescription className="text-lg">
                Your diamond inventory system is connected to the FastAPI server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                No diamonds found in your FastAPI database. Get started by adding diamonds to your inventory:
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
                <p>💡 <strong>Tip:</strong> Upload your diamond inventory CSV file to populate the dashboard</p>
                <p>📊 Real-time analytics will appear once you have inventory data</p>
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
        <DashboardHeader emergencyMode={connectionHealth === 'unhealthy'} />
        <ConnectionStatus />
        
        {/* User Login Tracking Section */}
        <UserLoginsSection />
        
        {/* Real Stats Grid from FastAPI */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Diamonds"
            value={displayStats.totalInventory || 0}
            icon={Gem}
            loading={isDataLoading}
            description={`$${(displayStats.totalValue || 0).toLocaleString()} total value`}
          />
          <StatCard
            title="Available"
            value={displayStats.availableDiamonds || 0}
            icon={Users}
            loading={isDataLoading}
            description={displayStats.totalInventory > 0 ? `${((displayStats.availableDiamonds || 0) / displayStats.totalInventory * 100).toFixed(1)}% of inventory` : 'No inventory'}
          />
          <StatCard
            title="Store Visible"
            value={displayStats.storeVisibleDiamonds || 0}
            icon={TrendingUp}
            loading={isDataLoading}
            description={displayStats.totalInventory > 0 ? `${((displayStats.storeVisibleDiamonds || 0) / displayStats.totalInventory * 100).toFixed(1)}% visible` : 'No inventory'}
          />
          <StatCard
            title="Avg Price/Ct"
            value={displayStats.avgPricePerCarat || 0}
            prefix="$"
            icon={Star}
            loading={isDataLoading}
            description="Per carat average"
          />
        </div>

        {/* Charts with Real Data */}
        <div className="grid gap-6 lg:grid-cols-2">
          <InventoryChart
            data={[
              { name: 'Round', value: allDiamonds.filter(d => d.shape === 'Round').length },
              { name: 'Princess', value: allDiamonds.filter(d => d.shape === 'Princess').length },
              { name: 'Emerald', value: allDiamonds.filter(d => d.shape === 'Emerald').length },
              { name: 'Oval', value: allDiamonds.filter(d => d.shape === 'Oval').length },
              { name: 'Other', value: allDiamonds.filter(d => !['Round', 'Princess', 'Emerald', 'Oval'].includes(d.shape)).length }
            ].filter(item => item.value > 0)}
            title="Inventory by Shape"
            loading={isDataLoading}
          />
          <InventoryChart
            data={[
              { name: 'D-F', value: allDiamonds.filter(d => ['D', 'E', 'F'].includes(d.color)).length },
              { name: 'G-H', value: allDiamonds.filter(d => ['G', 'H'].includes(d.color)).length },
              { name: 'I-J', value: allDiamonds.filter(d => ['I', 'J'].includes(d.color)).length },
              { name: 'K+', value: allDiamonds.filter(d => !['D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(d.color)).length }
            ].filter(item => item.value > 0)}
            title="Distribution by Color Grade"
            loading={isDataLoading}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {connectionHealth === 'healthy' ? 'Manage your real diamond inventory' : 'FastAPI connection needed for full functionality'}
            </CardDescription>
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
              <Button onClick={refetch} variant="outline" disabled={isDataLoading}>
                <Wifi className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Source Info */}
        <Card className={connectionHealth === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${connectionHealth === 'healthy' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <span className={connectionHealth === 'healthy' ? 'text-green-800' : 'text-blue-800'}>
                {connectionHealth === 'healthy' 
                  ? `Showing real data from FastAPI server (${displayStats.totalInventory || 0} diamonds)`
                  : 'FastAPI connection required - Using fallback data'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
