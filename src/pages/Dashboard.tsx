
import { useInventoryData } from '@/hooks/useInventoryData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { SecurityMonitor } from '@/components/auth/SecurityMonitor';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { loading, allDiamonds, fetchData } = useInventoryData();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Check for upload success notification
  useEffect(() => {
    const uploadSuccess = searchParams.get('upload_success');
    const fromBulkUpload = searchParams.get('from');
    
    if (uploadSuccess && fromBulkUpload === 'bulk_upload') {
      toast({
        title: `🎉 Bulk Upload Successful!`,
        description: `${uploadSuccess} diamonds have been added to your inventory and are now visible in your dashboard.`,
        duration: 5000,
      });
      
      // Clear the search parameters after showing the notification
      setSearchParams({});
      
      // Refresh inventory data to show newly uploaded diamonds
      fetchData();
    }
  }, [searchParams, setSearchParams, toast, fetchData]);

  const handleEmergencyMode = () => {
    // Emergency mode implementation
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 shadow-lg max-w-sm w-full">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-full"></div>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Authentication Required</h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Please authenticate through Telegram to access your dashboard.
            </p>
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-xl p-3">
              <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
              <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user ? `${user.first_name} (${user.id})` : 'None'}</p>
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
