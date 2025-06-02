
import React from 'react';
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart3, Crown, Bell, Eye } from "lucide-react";

interface SecondaryMetricsGridProps {
  avgCaratWeight: number;
  premiumDiamondsCount: number;
  unreadNotifications: number;
}

export function SecondaryMetricsGrid({ 
  avgCaratWeight, 
  premiumDiamondsCount, 
  unreadNotifications 
}: SecondaryMetricsGridProps) {
  return (
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
  );
}
