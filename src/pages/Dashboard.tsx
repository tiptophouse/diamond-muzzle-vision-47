
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();

  console.log('🔍 DASHBOARD DEBUG:');
  console.log('- Auth loading:', authLoading);
  console.log('- Is authenticated:', isAuthenticated);
  console.log('- User:', user);

  const handleEmergencyMode = () => {
    console.log('Emergency mode activated - skipping to basic dashboard');
  };

  if (authLoading) {
    return <DashboardLoading onEmergencyMode={handleEmergencyMode} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please authenticate through Telegram to access your dashboard.</p>
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
    </div>
  );
}
