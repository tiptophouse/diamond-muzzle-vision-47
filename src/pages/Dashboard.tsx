
import { useInventoryData } from '@/hooks/useInventoryData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { SecurityMonitor } from '@/components/auth/SecurityMonitor';
import { ApiStatusIndicator } from '@/components/dashboard/ApiStatusIndicator';
import { getVerificationResult } from '@/lib/api';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { loading, allDiamonds, fetchData } = useInventoryData();
  const verificationResult = getVerificationResult();

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
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <ApiStatusIndicator />
          <DataDrivenDashboard 
            allDiamonds={allDiamonds} 
            loading={loading}
            fetchData={fetchData} 
          />
        </div>
      </div>
      <SecurityMonitor />
    </>
  );
}
