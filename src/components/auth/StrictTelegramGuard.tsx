
import { ReactNode } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
import { Shield, Smartphone, AlertTriangle, RefreshCw } from 'lucide-react';
import { SimpleLogin } from './SimpleLogin';

interface StrictTelegramGuardProps {
  children: ReactNode;
}

export function StrictTelegramGuard({ children }: StrictTelegramGuardProps) {
  const {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated,
    showLogin,
    handleLoginSuccess
  } = useStrictTelegramAuth();

  console.log('🔒 StrictTelegramGuard state:', {
    isTelegramEnvironment,
    isAuthenticated,
    showLogin,
    userId: user?.id
  });

  const ADMIN_TELEGRAM_ID = 2138564172;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Verifying Access...</h3>
          <p className="text-blue-600 text-sm">Checking Telegram authentication...</p>
        </div>
      </div>
    );
  }

  // STRICT ENFORCEMENT: Only allow Telegram environment OR admin with OTP
  if (!isTelegramEnvironment) {
    // Check if this is the admin user trying to access
    if (user?.id === ADMIN_TELEGRAM_ID || showLogin) {
      console.log('🔐 Non-Telegram environment detected - showing admin OTP login');
      return <SimpleLogin onLogin={handleLoginSuccess} />;
    }

    // Block all other users completely
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border-2 border-red-200">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h2>
          <p className="text-red-700 mb-6">
            This application is exclusively available through Telegram Mini App.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-800 mb-3">How to Access:</h4>
            <ul className="text-red-700 text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>Open Telegram on your mobile device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>Search for the BrilliantBot</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>Launch the Mini App from within Telegram</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-100 p-3 rounded text-xs text-gray-600 mb-4">
            <div>Environment: Web Browser</div>
            <div>Status: Unauthorized</div>
            <div>Telegram Required: Yes</div>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // In Telegram environment but not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border-2 border-orange-200">
          <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="h-12 w-12 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-orange-900 mb-4">Authentication Required</h2>
          <p className="text-orange-700 mb-6">
            Unable to verify your Telegram identity. Please try refreshing or restarting the Mini App.
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-orange-800 mb-3">Troubleshooting:</h4>
            <ul className="text-orange-700 text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Close and reopen the Mini App</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Update Telegram to the latest version</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Restart Telegram completely</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-100 p-3 rounded text-xs text-gray-600 mb-4">
            <div>Environment: Telegram</div>
            <div>Status: Authentication Failed</div>
            <div>Error: {error || 'Unknown'}</div>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Retry Authentication
          </button>
        </div>
      </div>
    );
  }

  // Authenticated in Telegram - allow access
  console.log('✅ Access granted to Telegram user:', user.first_name);
  return <>{children}</>;
}
