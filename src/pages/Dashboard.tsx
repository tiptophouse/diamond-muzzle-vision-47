
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
  const { data, loading, error } = useDashboardData();
  const { trackEnhancedPageVisit } = useEnhancedUserTracking();

  // Track page visit
  useEffect(() => {
    trackEnhancedPageVisit('/dashboard', 'Dashboard');
  }, []);

  if (accessLoading || loading) {
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const mockData = {
    totalInventory: data?.totalInventory || 0,
    totalValue: data?.totalValue || 0,
    activeLeads: data?.activeLeads || 0,
    avgPricePerCarat: data?.avgPricePerCarat || 0,
    inventoryByShape: data?.inventoryByShape || [],
    inventoryByColor: data?.inventoryByColor || [],
    recentActivity: data?.recentActivity || []
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader emergencyMode={false} />
      
      <MetricsGrid 
        totalInventory={mockData.totalInventory}
        totalValue={mockData.totalValue}
        activeLeads={mockData.activeLeads}
        avgPricePerCarat={mockData.avgPricePerCarat}
        inventoryByShape={mockData.inventoryByShape}
        inventoryByColor={mockData.inventoryByColor}
        recentActivity={mockData.recentActivity}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryChart data={mockData.inventoryByShape} />
        <MarketInsights />
      </div>
      
      <PremiumCollection />
    </div>
  );
}
