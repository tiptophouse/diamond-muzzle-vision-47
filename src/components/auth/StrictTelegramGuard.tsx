
import { ReactNode } from 'react';
import { useOptimizedTelegramAuth } from '@/hooks/useOptimizedTelegramAuth';
import { Shield, Smartphone, AlertTriangle, RefreshCw } from 'lucide-react';

interface StrictTelegramGuardProps {
  children: ReactNode;
}

export function StrictTelegramGuard({ children }: StrictTelegramGuardProps) {
  const {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated
  } = useOptimizedTelegramAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Verifying Telegram Access...</h3>
          <p className="text-blue-600 text-sm">Strict security validation in progress...</p>
        </div>
      </div>
    );
  }

  // Access denied - strict enforcement
  if (!isAuthenticated || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            {!isTelegramEnvironment ? (
              <Smartphone className="h-12 w-12 text-red-600" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-red-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {!isTelegramEnvironment ? 'Telegram Mini App Only' : 'Authentication Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {!isTelegramEnvironment 
              ? 'This application can only be accessed through Telegram Mini App.'
              : error || 'Unable to verify your Telegram identity.'
            }
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-3">
              {!isTelegramEnvironment ? 'How to Access:' : 'What to do:'}
            </h4>
            <ul className="text-blue-700 text-sm space-y-2 text-left">
              {!isTelegramEnvironment ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Open Telegram on your mobile device</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Search for our bot or use the provided link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Start the Mini App from within Telegram</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Do NOT access via web browser</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Make sure you're logged into Telegram</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Close and reopen the Mini App</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Try restarting Telegram if the issue persists</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
          
          {/* Security notice */}
          <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
            🔒 This app uses strict security measures and only works within the official Telegram Mini App environment.
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated - show the app
  return <>{children}</>;
}
