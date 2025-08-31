
import React from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryData } from '@/hooks/useInventoryData';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { SecurityMonitor } from '@/components/auth/SecurityMonitor';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading, jwtToken } = useTelegramAuth();
  const { loading, allDiamonds, fetchData } = useInventoryData();
  const { isReady } = useUnifiedTelegramNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Handle debug mode
  useEffect(() => {
    const debug = searchParams.get('debug');
    if (debug === 'true') {
      toast({
        title: "Debug Mode Enabled",
        description: "Security monitor and detailed logs are now visible.",
        duration: 3000,
      });
    }
  }, [searchParams, toast]);

  const isDebugMode = searchParams.get('debug') === 'true';

  const toggleDebugMode = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (isDebugMode) {
      newSearchParams.delete('debug');
    } else {
      newSearchParams.set('debug', 'true');
    }
    setSearchParams(newSearchParams);
  };

  const handleEmergencyMode = () => {
    console.log('Emergency mode activated');
    toast({
      title: "Emergency Mode",
      description: "Emergency fallback activated",
      variant: "destructive",
    });
  };

  // Enhanced logging for debugging
  console.log('🏠 Dashboard State:', {
    authLoading,
    isAuthenticated,
    user: user ? `${user.first_name} (${user.id})` : null,
    jwtToken: !!jwtToken,
    inventoryLoading: loading,
    diamondsCount: allDiamonds.length,
    telegramReady: isReady
  });

  if (authLoading || !isReady) {
    return (
      <UnifiedLayout>
        <DashboardLoading onEmergencyMode={handleEmergencyMode} />
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="p-4 space-y-6">
        {isDebugMode && (
          <div className="space-y-4">
            <SecurityMonitor />
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Debug Information</h3>
              <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
              <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user ? `${user.first_name} (${user.id})` : 'None'}</p>
              <p>JWT Token: {jwtToken ? 'Present' : 'Missing'}</p>
            </div>
          </div>
        )}

        <DataDrivenDashboard 
          user={user}
          onDebugToggle={toggleDebugMode}
        />
      </div>
    </UnifiedLayout>
  );
}
