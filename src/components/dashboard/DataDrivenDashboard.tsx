
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Layout } from '@/components/layout/Layout';
import { Gem, Users, TrendingUp, Star } from 'lucide-react';
import { Diamond } from '@/components/inventory/InventoryTable';

interface DataDrivenDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export function DataDrivenDashboard({ allDiamonds, loading, fetchData }: DataDrivenDashboardProps) {
  const { user } = useTelegramAuth();

  console.log('🔍 DataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', allDiamonds.length);

  const { stats, inventoryByShape, salesByCategory } = processDiamondDataForDashboard(
    allDiamonds.map(d => ({
      id: parseInt(d.id),
      shape: d.shape,
      color: d.color,
      clarity: d.clarity,
      weight: d.carat,
      price_per_carat: d.price / d.carat,
      owners: [user?.id || 0],
    })),
    user?.id
  );

  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        <DashboardHeader emergencyMode={false} />
        
        {/* Stats Grid */}
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Diamonds"
            value={stats.totalDiamonds}
            icon={Gem}
            loading={loading}
          />
          <StatCard
            title="Matched Pairs"
            value={stats.matchedPairs}
            icon={Users}
            loading={loading}
          />
          <StatCard
            title="Market Leads"
            value={stats.totalLeads}
            icon={TrendingUp}
            loading={loading}
          />
          <StatCard
            title="Premium Items"
            value={stats.activeSubscriptions}
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
              <p>Raw Diamonds: {allDiamonds.length}</p>
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
