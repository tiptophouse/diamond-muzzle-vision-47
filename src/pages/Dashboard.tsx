
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { UserStatsCard } from '@/components/dashboard/UserStatsCard';
import { useOpenAccess } from '@/context/OpenAccessContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function Dashboard() {
  const { hasAccess, isBlocked, loading } = useOpenAccess();
  const { trackEnhancedPageVisit } = useEnhancedUserTracking();
  const { stats, loading: statsLoading, error } = useDashboardData();
  
  // Track page visit
  useEffect(() => {
    trackEnhancedPageVisit('/dashboard', 'Dashboard');
  }, []);

  const handleEmergencyMode = () => {
    console.log('Emergency mode activated');
  };

  if (loading || statsLoading) {
    return <DashboardLoading onEmergencyMode={handleEmergencyMode} />;
  }

  if (isBlocked) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Blocked</h1>
            <p className="text-gray-600">Your access has been restricted. Please contact support.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const metricsProps = {
    totalInventory: stats?.totalInventory || 0,
    totalValue: stats?.totalValue || 0,
    activeLeads: 0, // Not available in stats
    avgPricePerCarat: 0, // Not available in stats
    avgCaratWeight: 0, // Not available in stats
    premiumDiamondsCount: 0, // Not available in stats
    unreadNotifications: 0, // Not available in stats
  };

  return (
    <Layout>
      <div className="space-y-6">
        <DashboardHeader 
          emergencyMode={false}
          onEmergencyToggle={handleEmergencyMode}
        />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <MetricsGrid {...metricsProps} />
          </div>
          <div>
            <UserStatsCard />
          </div>
        </div>
        
        {error && (
          <div className="text-center text-red-600 mt-4">
            <p>Error loading dashboard data: {error}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
