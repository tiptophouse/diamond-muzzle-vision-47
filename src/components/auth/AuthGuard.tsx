
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

  // Authentication failed - show specific error messages
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 max-w-md mx-4">
        <div className="rounded-full w-20 h-20 bg-red-50 flex items-center justify-center mx-auto mb-6">
          {error?.includes('Invalid') || error?.includes('signature') ? (
            <Shield className="h-10 w-10 text-red-600" />
          ) : (
            <Lock className="h-10 w-10 text-red-600" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        
        <div className="text-left bg-red-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
          <p className="text-red-700 text-sm">{error || 'Unknown authentication error'}</p>
        </div>

        <div className="text-sm text-gray-600 mb-6 space-y-2">
          <p><strong>Environment:</strong> {isTelegramEnvironment ? 'Telegram WebApp' : 'Web Browser'}</p>
          <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
          <p><strong>Status:</strong> Authentication Failed</p>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <h4 className="font-semibold text-blue-800 mb-2">How to fix this:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Make sure you're accessing this app through the official Telegram bot</li>
              <li>• Close and reopen the Telegram app</li>
              <li>• Restart the bot conversation</li>
              <li>• Contact the administrator if the issue persists</li>
            </ul>
          </div>
          
          <button
            onClick={() => {
              console.log('🔄 Manual refresh requested');
              window.location.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
          >
            Retry Authentication
          </button>
        </div>
      </div>
    </div>
  );
}
