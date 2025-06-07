
import { useInventoryData } from '@/hooks/useInventoryData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { getVerificationResult } from '@/lib/api';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { loading, allDiamonds, debugInfo } = useInventoryData();
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
    return <DashboardLoading onEmergencyMode={handleEmergencyMode} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">FastAPI Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please authenticate through Telegram to access your dashboard.</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
            <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user ? `${user.first_name} (${user.id})` : 'None'}</p>
            <p>FastAPI Verification: {verificationResult ? 'Success' : 'Failed'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DataDrivenDashboard />
      
      {/* FastAPI Integration Debug Panel */}
      <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs max-h-96 overflow-y-auto">
        <h4 className="font-bold mb-2">🔍 FastAPI Integration Debug</h4>
        <div className="space-y-1">
          <p><strong>Backend:</strong> mazalbot.app/api/v1</p>
          <p><strong>User ID:</strong> {user.id} ({typeof user.id})</p>
          <p><strong>Verified:</strong> {verificationResult?.success ? 'Yes' : 'No'}</p>
          <p><strong>Diamonds:</strong> {allDiamonds.length}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Auth:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          
          {debugInfo.step && <p><strong>Step:</strong> {debugInfo.step}</p>}
          {debugInfo.error && <p className="text-red-300"><strong>Error:</strong> {debugInfo.error}</p>}
          {debugInfo.endpoint && <p><strong>Endpoint:</strong> {debugInfo.endpoint}</p>}
          
          {verificationResult && (
            <div className="mt-2">
              <p><strong>Verification Result:</strong></p>
              <pre className="text-xs bg-gray-800 p-1 rounded mt-1 overflow-x-auto">
                {JSON.stringify(verificationResult, null, 1)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
