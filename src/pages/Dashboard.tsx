
import React, { useEffect } from 'react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { SecurityMonitor } from '@/components/auth/SecurityMonitor';
import { getVerificationResult } from '@/lib/api';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { loading, allDiamonds, fetchData } = useInventoryData();
  const verificationResult = getVerificationResult();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const uploadSuccess = searchParams.get('upload_success');
    const fromBulkUpload = searchParams.get('from');
    
    if (uploadSuccess && fromBulkUpload === 'bulk_upload') {
      toast({
        title: `🎉 Bulk Upload Successful!`,
        description: `${uploadSuccess} diamonds have been added to your inventory.`,
        duration: 5000,
      });
      
      setSearchParams({});
      fetchData();
    }
  }, [searchParams, setSearchParams, toast, fetchData]);

  logger.log('🔍 Dashboard Debug:', {
    authLoading,
    isAuthenticated,
    user: user?.first_name,
    diamondsCount: allDiamonds.length
  });

  const handleEmergencyMode = () => {
    logger.log('Emergency mode activated');
  };

  if (authLoading || loading) {
    return (
      <>
        <DashboardLoading onEmergencyMode={handleEmergencyMode} />
        <SecurityMonitor />
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 bg-card rounded-lg shadow-md max-w-md border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please authenticate through Telegram to access your dashboard.</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
              <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user ? `${user.first_name} (${user.id})` : 'None'}</p>
              <p>Verification: {verificationResult ? 'Success' : 'Failed'}</p>
            </div>
          </div>
        </div>
        <SecurityMonitor />
      </>
    );
  }

  return (
    <>
      <DataDrivenDashboard 
        allDiamonds={allDiamonds} 
        loading={loading}
        fetchData={fetchData} 
      />
      <SecurityMonitor />
    </>
  );
}
