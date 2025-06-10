
import { useOptimizedPostgresInventory } from '@/hooks/useOptimizedPostgresInventory';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Layout } from '@/components/layout/Layout';
import { Gem, Users, TrendingUp, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DataDrivenDashboard() {
  const { user } = useTelegramAuth();
  const { diamonds, loading, error } = useOptimizedPostgresInventory();

  console.log('🔍 DataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', diamonds.length);

  // Process the data only if we have diamonds
  const { stats, inventoryByShape, salesByCategory } = diamonds.length > 0 
    ? processDiamondDataForDashboard(
        diamonds.map(d => ({
          id: parseInt(d.id),
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

  const handleAddSampleData = () => {
    console.log('Adding sample data...');
    // This could trigger a function to add sample diamonds to the database
  };

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="space-y-4 p-2 sm:p-4">
          <DashboardHeader emergencyMode={true} />
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <h3 className="text-lg font-semibold">Database Connection Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show empty state when no diamonds
  if (!loading && diamonds.length === 0) {
    return (
      <Layout>
        <div className="space-y-4 p-2 sm:p-4">
          <DashboardHeader emergencyMode={false} />
          <div className="text-center py-8">
            <Gem className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No diamonds in inventory</h3>
            <p className="text-gray-600 mb-4">Get started by adding some diamonds to your inventory</p>
            <Button onClick={handleAddSampleData} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Sample Data
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        <DashboardHeader emergencyMode={false} />
        
        {/* Stats Grid */}
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Diamonds"
            value={Number(stats.totalDiamonds)}
            icon={Gem}
            loading={loading}
          />
          <StatCard
            title="Matched Pairs"
            value={Number(stats.matchedPairs)}
            icon={Users}
            loading={loading}
          />
          <StatCard
            title="Market Leads"
            value={Number(stats.totalLeads)}
            icon={TrendingUp}
            loading={loading}
          />
          <StatCard
            title="Premium Items"
            value={Number(stats.activeSubscriptions)}
            icon={Star}
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <InventoryChart
            data={inventoryByShape}
            title="Inventory by Shape"
            loading={loading}
          />
          <InventoryChart
            data={salesByCategory}
            title="Distribution by Color"
            loading={loading}
          />
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
            <h4 className="font-bold mb-2">📊 Dashboard Debug</h4>
            <div className="grid gap-2 text-xs">
              <p>User ID: {user?.id}</p>
              <p>Raw Diamonds: {diamonds.length}</p>
              <p>Processed Stats: {JSON.stringify(stats)}</p>
              <p>Shape Distribution: {inventoryByShape.length} categories</p>
              <p>Color Distribution: {salesByCategory.length} categories</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
