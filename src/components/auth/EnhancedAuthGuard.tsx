
import { ReactNode, useEffect } from 'react';
import { useEnhancedTelegramAuth } from '@/hooks/useEnhancedTelegramAuth';
import { useCurrentUserBlockStatus } from '@/hooks/useCurrentUserBlockStatus';
import { handleTelegramRedirect, recoverFromUrlError } from '@/utils/urlHandler';
import { AlertTriangle, Shield, RefreshCw } from 'lucide-react';

interface EnhancedAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function EnhancedAuthGuard({ children, fallback }: EnhancedAuthGuardProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    isTelegramEnvironment, 
    user, 
    error, 
    retryAuth, 
    retryCount 
  } = useEnhancedTelegramAuth();
  
  const { isBlocked, isLoading: blockCheckLoading } = useCurrentUserBlockStatus();

  // Handle URL issues on mount
  useEffect(() => {
    try {
      handleTelegramRedirect();
    } catch (error) {
      console.error('Error handling Telegram redirect:', error);
      recoverFromUrlError();
    }
  }, []);

  // Show loading while checking auth and block status
  if (isLoading || blockCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Diamond Muzzle</h3>
          <p className="text-blue-600 text-sm mb-4">
            {retryCount > 0 ? `Reconnecting... (${retryCount}/3)` : 'Initializing your session...'}
          </p>
          
          {/* Enhanced error display */}
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">{error}</p>
              <button
                onClick={retryAuth}
                className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
              >
                <RefreshCw className="inline w-3 h-3 mr-1" />
                Retry Connection
              </button>
            </div>
          )}
          
          {/* Manual recovery options */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => {
                console.log('🔄 Manual refresh requested');
                window.location.reload();
              }}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Refresh App
            </button>
            
            <button
              onClick={() => {
                console.log('🏠 Redirecting to home');
                window.location.href = window.location.origin + '/#/';
              }}
              className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Go to Home
            </button>
          </div>
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

  // Enhanced fallback with multiple recovery options
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 max-w-md mx-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-400 border-t-transparent mx-auto mb-6"></div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Connecting...</h3>
        <p className="text-gray-600 text-sm mb-6">Please wait while we establish your session</p>
        
        {/* Enhanced recovery options */}
        <div className="space-y-3">
          <button
            onClick={retryAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
          
          <button
            onClick={() => {
              console.log('🔄 Manual refresh requested');
              window.location.reload();
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-sm w-full"
          >
            Refresh App
          </button>
          
          <button
            onClick={() => {
              console.log('🏠 Navigate to home');
              window.location.href = window.location.origin + '/#/';
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm w-full"
          >
            Go to Home
          </button>
        </div>
        
        {error && (
          <div className="mt-6 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
