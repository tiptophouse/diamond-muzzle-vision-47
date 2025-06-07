
import { useInventoryData } from '@/hooks/useInventoryData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { loading, allDiamonds, debugInfo } = useInventoryData();

  console.log('🔍 DASHBOARD DEBUG:');
  console.log('- Auth loading:', authLoading);
  console.log('- Is authenticated:', isAuthenticated);
  console.log('- User:', user);
  console.log('- User ID:', user?.id, 'type:', typeof user?.id);
  console.log('- Inventory loading:', loading);
  console.log('- Diamonds count:', allDiamonds.length);
  console.log('- Debug info:', debugInfo);

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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please authenticate to access your dashboard.</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
            <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user ? `${user.first_name} (${user.id})` : 'None'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DataDrivenDashboard />
      
      {/* Enhanced Debug Panel - Visible in production for troubleshooting */}
      <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs max-h-96 overflow-y-auto">
        <h4 className="font-bold mb-2">🔍 Telegram Debug Info</h4>
        <div className="space-y-1">
          <p><strong>User ID:</strong> {user.id} ({typeof user.id})</p>
          <p><strong>User Name:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Diamonds:</strong> {allDiamonds.length}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Auth:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          
          {debugInfo.step && <p><strong>Step:</strong> {debugInfo.step}</p>}
          {debugInfo.error && <p className="text-red-300"><strong>Error:</strong> {debugInfo.error}</p>}
          {debugInfo.endpoint && <p><strong>Endpoint:</strong> {debugInfo.endpoint}</p>}
          {debugInfo.rawDataCount !== undefined && <p><strong>Raw API Count:</strong> {debugInfo.rawDataCount}</p>}
          {debugInfo.convertedCount !== undefined && <p><strong>Converted Count:</strong> {debugInfo.convertedCount}</p>}
          
          {debugInfo.sampleRawData && (
            <div className="mt-2">
              <p><strong>Sample Raw Data:</strong></p>
              <pre className="text-xs bg-gray-800 p-1 rounded mt-1 overflow-x-auto">
                {JSON.stringify(debugInfo.sampleRawData, null, 1)}
              </pre>
            </div>
          )}
          
          {debugInfo.sampleConverted && (
            <div className="mt-2">
              <p><strong>Sample Converted:</strong></p>
              <pre className="text-xs bg-gray-800 p-1 rounded mt-1 overflow-x-auto">
                {JSON.stringify(debugInfo.sampleConverted, null, 1)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
