
import React from 'react';
import { StatCard } from "@/components/dashboard/StatCard";
import { Diamond, DollarSign, Users, TrendingUp } from "lucide-react";

interface KeyMetricsGridProps {
  totalInventory: number;
  totalValue: number;
  activeLeads: number;
  avgPricePerCarat: number;
}

export function KeyMetricsGrid({ 
  totalInventory, 
  totalValue, 
  activeLeads, 
  avgPricePerCarat 
}: KeyMetricsGridProps) {
  return (
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
  );
}
