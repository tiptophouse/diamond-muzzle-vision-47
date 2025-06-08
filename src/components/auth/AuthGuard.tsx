
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Authenticating...</h3>
          <p className="text-blue-600 text-sm">Verifying Telegram credentials</p>
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

  // Authenticated user
  if (user && isAuthenticated && !error) {
    return <>{children}</>;
  }

  // Authentication failed - show helpful error message
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 max-w-md mx-4">
        <div className="rounded-full w-20 h-20 bg-red-50 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        
        <p className="text-red-700 text-sm mb-6">
          Failed to verify your Telegram authentication with our servers.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg text-left mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">To access this application:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
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
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full"
        >
          Try Again
        </button>
        
        <p className="text-xs text-gray-500 mt-4">@boltnewbot</p>
      </div>
    </div>
  );
}
