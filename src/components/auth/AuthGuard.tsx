
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useCurrentUserBlockStatus } from '@/hooks/useCurrentUserBlockStatus';
import { AlertTriangle, Shield } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isTelegramEnvironment, user, error } = useTelegramAuth();
  const { isBlocked, isLoading: blockCheckLoading } = useCurrentUserBlockStatus();

  // Show loading while checking auth and block status
  if (isLoading || blockCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Loading...</h3>
          <p className="text-blue-600 text-sm">Initializing Diamond Muzzle</p>
          {error && (
            <div className="mt-4 text-xs text-red-600 bg-red-50 p-2 rounded">
              Error: {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if user is blocked - show access denied
  if (isBlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-4">Access Blocked</h2>
          <p className="text-red-700 mb-6">
            Your account has been temporarily restricted. Please contact support if you believe this is an error.
          </p>
          <p className="text-sm text-red-600 mb-8">
            User ID: {user?.id || 'Unknown'}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              If you need assistance, please reach out to our support team with your User ID.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Development mode indicator
  if (!isTelegramEnvironment && user) {
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

  // Always render if we have a user and they're not blocked
  if (user && !isBlocked) {
    return <>{children}</>;
  }

  // Final fallback with manual refresh option
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 max-w-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Connecting...</h3>
        <p className="text-gray-600 text-sm mb-4">Please wait while we establish your session</p>
        
        <button
          onClick={() => {
            console.log('🔄 Manual refresh requested');
            window.location.reload();
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Refresh App
        </button>
        
        {error && (
          <div className="mt-4 text-xs text-red-600 bg-red-50 p-2 rounded">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
