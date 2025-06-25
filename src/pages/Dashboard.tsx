
import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { useDashboardData } from '@/hooks/useDashboardData';
import { UserStatsCard } from '@/components/dashboard/UserStatsCard';
import { useOpenAccess } from '@/context/OpenAccessContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';

export default function Dashboard() {
  const { hasAccess, isBlocked, loading } = useOpenAccess();
  const { trackEnhancedPageVisit } = useEnhancedUserTracking();
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  const { stats, clients, isLoading, refetch } = useDashboardData();

  useEffect(() => {
    trackEnhancedPageVisit('/dashboard', 'Dashboard');
  }, []);

  const handleEmergencyMode = () => {
    setEmergencyMode(true);
  };

  if (loading && !emergencyMode) {
    return <DashboardLoading onEmergencyMode={handleEmergencyMode} />;
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

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Diamond Inventory</h1>
          <p className="text-gray-600">Please wait while we set up your access...</p>
        </div>
      </div>
    );
  }

  // Default metrics for when stats are not available
  const defaultMetrics = {
    totalInventory: stats?.totalInventory || 0,
    totalValue: stats?.totalValue || 0,
    activeLeads: stats?.pendingQueries || 0,
    avgPricePerCarat: 5000,
    avgCaratWeight: 1.2,
    premiumDiamondsCount: 0,
    unreadNotifications: 3
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader emergencyMode={emergencyMode} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <MetricsGrid {...defaultMetrics} />
          </div>
          <div className="lg:col-span-1">
            <UserStatsCard />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {clients.map((client) => (
              <li key={client.id}>
                <a href="#" className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{client.first_name} {client.last_name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {client.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">Telegram ID:</span>
                          {client.telegram_id}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span>Last Active:</span>
                        <time dateTime={client.last_active || client.created_at}>{client.last_active || client.created_at}</time>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
