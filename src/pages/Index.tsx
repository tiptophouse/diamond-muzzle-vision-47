
import { useDebugTelegramAuth } from '@/hooks/useDebugTelegramAuth';
import { AuthDebugPanel } from '@/components/debug/AuthDebugPanel';
import { TelegramOnlyGuard } from '@/components/auth/TelegramOnlyGuard';
import { Navigate } from 'react-router-dom';

export default function Index() {
  const { 
    user, 
    isLoading, 
    error, 
    isTelegramEnvironment, 
    isAuthenticated, 
    debugSteps 
  } = useDebugTelegramAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">🔍 Debug Authentication</h3>
          <p className="text-blue-600">Analyzing authentication flow...</p>
        </div>
      </div>
    );
  }

  // Show debug panel for analysis
  if (process.env.NODE_ENV === 'development' || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthDebugPanel 
          debugSteps={debugSteps}
          user={user}
          isAuthenticated={isAuthenticated}
          error={error}
        />
        
        {isAuthenticated && (
          <div className="p-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }

  // If authenticated successfully, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
}
