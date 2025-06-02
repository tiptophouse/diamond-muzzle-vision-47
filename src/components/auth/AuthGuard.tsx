
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isTelegramEnvironment, user, error } = useTelegramAuth();

  // Fast loading state with timeout protection
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Loading...</h3>
          <p className="text-blue-600 text-sm">Initializing Diamond Muzzle</p>
          <div className="mt-4 text-xs text-blue-500">
            {error && `Error: ${error}`}
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

  // Always render if we have a user (authenticated or fallback)
  if (user) {
    return <>{children}</>;
  }

  // Final safe fallback with manual refresh option
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 max-w-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Connecting...</h3>
        <p className="text-gray-600 text-sm mb-4">Please wait while we establish your session</p>
        
        {/* Emergency refresh button */}
        <button
          onClick={() => window.location.reload()}
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
