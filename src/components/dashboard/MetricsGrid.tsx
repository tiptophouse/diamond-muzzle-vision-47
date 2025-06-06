
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendingUp, Users, Crown, Bell, Diamond, DollarSign, BarChart3, Eye } from "lucide-react";

interface MetricsGridProps {
  totalInventory: number;
  totalValue: number;
  activeLeads: number;
  avgPricePerCarat: number;
  avgCaratWeight: number;
  premiumDiamondsCount: number;
  unreadNotifications: number;
}

export function MetricsGrid({
  totalInventory,
  totalValue,
  activeLeads,
  avgPricePerCarat,
  avgCaratWeight,
  premiumDiamondsCount,
  unreadNotifications
}: MetricsGridProps) {
  return (
    <>
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
          value={premiumDiamondsCount} 
          description=">2ct or >$10k" 
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
    </>
  );
}
