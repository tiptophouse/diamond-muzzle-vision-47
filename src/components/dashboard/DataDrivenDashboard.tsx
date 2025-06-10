
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useOptimizedPostgresInventory } from '@/hooks/useOptimizedPostgresInventory';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Layout } from '@/components/layout/Layout';
import { SampleDataButton } from '@/components/inventory/SampleDataButton';
import { Gem, Users, TrendingUp, Star } from 'lucide-react';

export function DataDrivenDashboard() {
  const { user } = useTelegramAuth();
  const { diamonds, loading, error } = useOptimizedPostgresInventory();

  console.log('🔍 DataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', diamonds.length);

  // Process diamond data for dashboard analytics
  const stats = {
    totalDiamonds: diamonds.length,
    availableDiamonds: diamonds.filter(d => d.status === 'Available').length,
    totalValue: diamonds.reduce((sum, d) => sum + d.price, 0),
    averagePrice: diamonds.length > 0 ? Math.round(diamonds.reduce((sum, d) => sum + d.price, 0) / diamonds.length) : 0,
  };

  // Group diamonds by shape for chart
  const inventoryByShape = diamonds.reduce((acc: any[], diamond) => {
    const existing = acc.find(item => item.name === diamond.shape);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: diamond.shape, value: 1 });
    }
    return acc;
  }, []);

  // Group diamonds by color for chart
  const salesByCategory = diamonds.reduce((acc: any[], diamond) => {
    const existing = acc.find(item => item.name === diamond.color);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: diamond.color, value: 1 });
    }
    return acc;
  }, []);

  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        <DashboardHeader emergencyMode={false} />
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Dashboard Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600">Unable to load inventory data from PostgreSQL</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Diamonds"
            value={stats.totalDiamonds}
            icon={Gem}
            loading={loading}
          />
          <StatCard
            title="Available"
            value={stats.availableDiamonds}
            icon={Users}
            loading={loading}
          />
          <StatCard
            title="Total Value"
            value={`$${stats.totalValue.toLocaleString()}`}
            icon={TrendingUp}
            loading={loading}
          />
          <StatCard
            title="Avg Price"
            value={`$${stats.averagePrice.toLocaleString()}`}
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

        {/* Empty State with Sample Data */}
        {!loading && diamonds.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 max-w-lg mx-auto">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Dashboard Ready</h3>
              <p className="text-blue-700 mb-6">Your dashboard is connected to the optimized PostgreSQL system. Add some diamonds to see analytics and insights.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <SampleDataButton />
              </div>
              
              <div className="mt-6 text-sm text-blue-600">
                <p>⚡ Using ultra-fast PostgreSQL connection</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
            <h4 className="font-bold mb-2">📊 Dashboard Debug (PostgreSQL)</h4>
            <div className="grid gap-2 text-xs">
              <p>User ID: {user?.id}</p>
              <p>PostgreSQL Diamonds: {diamonds.length}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
              <p>Stats: Total: {stats.totalDiamonds}, Available: {stats.availableDiamonds}</p>
              <p>Shape Distribution: {inventoryByShape.length} categories</p>
              <p>Color Distribution: {salesByCategory.length} categories</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
