
import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isTelegramEnvironment, user, error } = useTelegramAuth();
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);

  useEffect(() => {
    const loadAdminId = async () => {
      try {
        const adminId = await getAdminTelegramId();
        setAdminTelegramId(adminId);
      } catch (error) {
        console.error('Failed to load admin ID:', error);
        // Don't set fallback - force proper configuration
      }
    };
    loadAdminId();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Authenticating...</h3>
          <p className="text-blue-600 text-sm">Connecting to Telegram...</p>
          <div className="mt-6 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user gets access
  if (isAuthenticated && user) {
    // Show development indicator for admin in non-telegram environment
    if (adminTelegramId && user.id === adminTelegramId && (!isTelegramEnvironment || process.env.NODE_ENV === 'development')) {
      return (
        <div className="min-h-screen bg-background">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200 p-3">
            <div className="flex items-center justify-center gap-3 text-green-800">
              <Shield size={16} />
              <span className="text-sm font-medium">
                Admin Access - {user.first_name} {user.last_name}
              </span>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          {children}
        </div>
      );
    }
    
    // Regular authenticated user
    return <>{children}</>;
  }

  // Show error/not authenticated
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center p-8 max-w-md mx-4 bg-white rounded-xl shadow-lg border">
        <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Error Details:</h4>
              <p className="text-yellow-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">How to Access:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Make sure you're accessing this app through Telegram</li>
              <li>• Check your internet connection</li>
              <li>• Try refreshing the app</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={() => {
              console.log('🔄 Manual refresh requested');
              window.location.reload();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh App
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              Development Info:<br/>
              Environment: {isTelegramEnvironment ? 'Telegram' : 'Browser'}<br/>
              User: {user?.id || 'None'}<br/>
              Authenticated: {isAuthenticated ? 'Yes' : 'No'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
