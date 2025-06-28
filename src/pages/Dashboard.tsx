
import React, { useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { useOpenAccess } from '@/context/OpenAccessContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { useInventoryData } from '@/hooks/useInventoryData';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';

export default function Dashboard() {
  const { hasAccess, isBlocked, loading: accessLoading } = useOpenAccess();
  const { trackEnhancedPageVisit } = useEnhancedUserTracking();
  const { allDiamonds, loading, error, fetchData } = useInventoryData();

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

  return (
    <DataDrivenDashboard 
      allDiamonds={allDiamonds}
      loading={loading}
      fetchData={fetchData}
      error={error}
    />
  );
}
