
import { useInventoryData } from '@/hooks/useInventoryData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { SecurityMonitor } from '@/components/auth/SecurityMonitor';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading, jwtToken } = useTelegramAuth();
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

  console.log('🔍 DASHBOARD DEBUG:');
  console.log('- Auth loading:', authLoading);
  console.log('- Is authenticated:', isAuthenticated);
  console.log('- User:', user);
  console.log('- JWT Token present:', !!jwtToken);
  console.log('- Inventory loading:', loading);
  console.log('- Diamonds count:', allDiamonds.length);

  const handleEmergencyMode = () => {
    console.log('Emergency mode activated - skipping to basic dashboard');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enhanced Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please authenticate through Telegram to access your dashboard.</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
              <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user ? `${user.first_name} (${user.id})` : 'None'}</p>
              <p>JWT Token: {jwtToken ? 'Present' : 'Missing'}</p>
            </div>
          </div>
        </div>
        <SecurityMonitor />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <DataDrivenDashboard 
          allDiamonds={allDiamonds} 
          loading={loading}
          fetchData={fetchData} 
        />
      </div>
      <SecurityMonitor />
    </>
  );
}
