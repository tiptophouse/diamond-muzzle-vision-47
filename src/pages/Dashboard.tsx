
import { useInventoryData } from '@/hooks/useInventoryData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { SecurityMonitor } from '@/components/auth/SecurityMonitor';
import { getVerificationResult } from '@/lib/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { loading, allDiamonds, fetchData } = useInventoryData();
  const verificationResult = getVerificationResult();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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

  // First-time redirect for new users without inventory (unless coming from group CTA dashboard button)
  useEffect(() => {
    if (authLoading || loading) return;
    if (!isAuthenticated || !user) return;

    const visitKey = `visited_dashboard_${user.id}`;
    const hasVisited = localStorage.getItem(visitKey);
    
    // Check if user came directly from group CTA dashboard button
    const dashboardDirect = searchParams.get('start') === 'dashboard_direct';

    if (!hasVisited && allDiamonds.length === 0 && !dashboardDirect) {
      localStorage.setItem(visitKey, '1');
      toast({
        title: 'ברוכים הבאים! 👋',
        description: 'בואו נעלה את היהלום הראשון שלכם כדי לפתוח הזדמנויות חדשות.',
        duration: 4000,
      });
      navigate('/upload-single-stone?from=dashboard_first_time');
      return;
    }
    
    // Clear start parameter if it exists
    if (dashboardDirect) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('start');
      setSearchParams(newParams);
    }
  }, [authLoading, loading, isAuthenticated, user, allDiamonds.length, navigate, toast, searchParams, setSearchParams]);

  console.log('🔍 DASHBOARD DEBUG:');
  console.log('- Auth loading:', authLoading);
  console.log('- Is authenticated:', isAuthenticated);
  console.log('- User:', user);
  console.log('- FastAPI verification:', verificationResult);
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
              <p>Enhanced Verification: {verificationResult ? 'Success' : 'Failed'}</p>
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
