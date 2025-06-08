
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { AlertTriangle, Shield } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isTelegramEnvironment, user, error } = useTelegramAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 max-w-sm">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Authenticating...</h3>
          <p className="text-blue-600 text-sm">Validating Telegram credentials</p>
        </div>
      </div>
    );
  }

  // Authentication failed
  if (!isAuthenticated || error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          
          <p className="text-red-700 mb-6">
            {error || 'Authentication required to access Diamond Muzzle'}
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-red-800 mb-2">To access this application:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Open the app through Telegram</li>
              <li>• Ensure you have a stable internet connection</li>
              <li>• Make sure you're using the latest version of Telegram</li>
            </ul>
          </div>
          
          <button
            onClick={() => {
              console.log('🔄 Manual refresh requested');
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-red-600 bg-red-50 p-2 rounded border">
              Dev Info: {error || 'No user authenticated'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Development mode indicator
  if (!isTelegramEnvironment && user && process.env.NODE_ENV === 'development') {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b border-yellow-200 p-2">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertTriangle size={14} />
            <span className="text-xs font-medium">
              Dev Mode - {user.first_name} {user.last_name}
            </span>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Authenticated user - render app
  return <>{children}</>;
}
