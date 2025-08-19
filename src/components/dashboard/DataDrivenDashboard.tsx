
import React, { useMemo } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { FixedDashboardStats } from "./FixedDashboardStats";
import { InventoryChart } from "./InventoryChart";
import { MarketInsights } from "./MarketInsights";
import { Diamond } from "@/components/inventory/InventoryTable";
import { processDiamondDataForDashboard } from "@/services/dashboardDataProcessor";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface DataDrivenDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export function DataDrivenDashboard({ 
  allDiamonds, 
  loading, 
  fetchData 
}: DataDrivenDashboardProps) {
  const { user } = useTelegramAuth();
  
  console.log('🔍 DataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', allDiamonds.length);
  
  const { stats, inventoryByShape, salesByCategory } = useMemo(() => {
    return processDiamondDataForDashboard(allDiamonds, user?.id);
  }, [allDiamonds, user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 pb-20">
        <DashboardHeader onRefresh={fetchData} loading={loading} />
        
        <FixedDashboardStats diamonds={allDiamonds} />
        
        {allDiamonds.length > 0 && (
          <>
            <InventoryChart 
              data={inventoryByShape}
              totalDiamonds={stats.totalDiamonds}
            />
            
            <MarketInsights 
              data={salesByCategory}
              matchedPairs={stats.matchedPairs}
              totalLeads={stats.totalLeads}
            />
          </>
        )}
        
        {allDiamonds.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No diamonds in your inventory yet
            </div>
            <p className="text-sm text-muted-foreground">
              Upload your first diamonds to see analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
