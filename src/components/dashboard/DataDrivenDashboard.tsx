import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { MarketInsights } from '@/components/dashboard/MarketInsights';
import { PremiumCollection } from '@/components/dashboard/PremiumCollection';
import { Diamond } from '@/components/inventory/InventoryTable';
import { PlatformDiamondCount } from "./PlatformDiamondCount";

interface DataDrivenDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export function DataDrivenDashboard({ allDiamonds, loading, fetchData }: DataDrivenDashboardProps) {
  const { user } = useTelegramAuth();

  // Calculate metrics
  const totalInventory = allDiamonds.length;
  const totalValue = allDiamonds.reduce((sum, diamond) => sum + diamond.price, 0);
  const activeLeads = 42; // Example metric
  const avgPricePerCarat = totalInventory > 0 ? totalValue / totalInventory : 0;
  const avgCaratWeight = totalInventory > 0 ? allDiamonds.reduce((sum, d) => sum + d.carat, 0) / totalInventory : 0;
  const premiumDiamondsCount = allDiamonds.filter(d => d.carat > 2 || d.price > 10000).length;
  const unreadNotifications = 7;

  // Filter premium collection
  const premiumDiamonds = allDiamonds.filter(diamond => diamond.price > 5000).slice(0, 5);

  return (
    <div className="space-y-4 p-4">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4 mb-6">
        <DashboardHeader 
          userName={user?.first_name || 'User'} 
          lastSync={new Date().toLocaleString()}
          onRefresh={fetchData}
        />
        
        {/* Platform Diamond Count */}
        <PlatformDiamondCount />
      </div>

      {/* Performance Metrics */}
      <MetricsGrid
        totalInventory={totalInventory}
        totalValue={totalValue}
        activeLeads={activeLeads}
        avgPricePerCarat={avgPricePerCarat}
        avgCaratWeight={avgCaratWeight}
        premiumDiamondsCount={premiumDiamondsCount}
        unreadNotifications={unreadNotifications}
      />

      {/* Charts and Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <InventoryChart diamonds={allDiamonds} />
        <MarketInsights diamonds={allDiamonds} />
      </div>

      {/* Premium Collection */}
      <PremiumCollection 
        premiumDiamonds={premiumDiamonds}
        onRefresh={fetchData}
      />
    </div>
  );
}
