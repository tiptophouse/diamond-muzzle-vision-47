
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
      
      {/* Debug Panel - Remove this after debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs">
          <h4 className="font-bold mb-2">🔍 Debug Info</h4>
          <div className="space-y-1">
            <p>User ID: {user.id}</p>
            <p>Diamonds: {allDiamonds.length}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Debug Step: {debugInfo.step || 'None'}</p>
            {debugInfo.error && <p className="text-red-300">Error: {debugInfo.error}</p>}
            {debugInfo.rawDataCount && <p>Raw API Count: {debugInfo.rawDataCount}</p>}
            {debugInfo.convertedCount && <p>Converted Count: {debugInfo.convertedCount}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
