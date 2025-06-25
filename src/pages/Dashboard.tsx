
import React, { useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { MarketInsights } from '@/components/dashboard/MarketInsights';
import { PremiumCollection } from '@/components/dashboard/PremiumCollection';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useOpenAccess } from '@/context/OpenAccessContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';

export default function Dashboard() {
  const { hasAccess, isBlocked, loading: accessLoading } = useOpenAccess();
  const { stats, clients, isLoading, refetch } = useDashboardData();
  const { trackEnhancedPageVisit } = useEnhancedUserTracking();

  // Track page visit
  useEffect(() => {
    trackEnhancedPageVisit('/dashboard', 'Dashboard');
  }, []);

  if (accessLoading || isLoading) {
    return <DashboardLoading onEmergencyMode={() => {}} />;
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Blocked</h1>
          <p className="text-gray-600">Your access has been restricted. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Create mock data structure that matches component expectations
  const mockData = {
    totalInventory: stats?.totalInventory || 0,
    totalValue: stats?.totalValue || 0,
    activeLeads: stats?.activeClients || 0,
    avgPricePerCarat: stats?.totalValue && stats?.totalInventory 
      ? Math.round(stats.totalValue / stats.totalInventory) 
      : 0,
    inventoryByShape: [
      { name: 'Round', value: Math.floor(Math.random() * 10) + 1 },
      { name: 'Princess', value: Math.floor(Math.random() * 5) + 1 },
      { name: 'Emerald', value: Math.floor(Math.random() * 3) + 1 },
      { name: 'Oval', value: Math.floor(Math.random() * 4) + 1 },
    ],
    recentActivity: []
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader emergencyMode={false} />
      
      <MetricsGrid 
        totalInventory={mockData.totalInventory}
        totalValue={mockData.totalValue}
        activeLeads={mockData.activeLeads}
        avgPricePerCarat={mockData.avgPricePerCarat}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryChart 
          data={mockData.inventoryByShape} 
          title="Inventory by Shape"
        />
        <MarketInsights />
      </div>
      
      <PremiumCollection 
        premiumDiamonds={[]}
      />
    </div>
  );
}
