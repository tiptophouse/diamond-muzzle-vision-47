import { ReactNode } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { AlertTriangle, RefreshCw, Shield, Clock } from 'lucide-react';

interface SecureAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SecureAuthGuard({ children, fallback }: SecureAuthGuardProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    isTelegramEnvironment, 
    user, 
    error, 
    securityMetrics,
    isLockedOut,
    retryAuth 
  } = useSecureAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Secure Authentication</h3>
          <p className="text-blue-600 text-sm">Verifying credentials...</p>
          <div className="mt-6 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user gets access
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-background">
        {securityMetrics.securityLevel !== 'high' && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-b border-yellow-200 p-2">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <AlertTriangle size={14} />
              <span className="text-xs font-medium">
                Security Level: {securityMetrics.securityLevel.toUpperCase()}
              </span>
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }

  // Lockout state
  if (isLockedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 max-w-md mx-4 bg-white rounded-xl shadow-lg border border-red-200">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Temporarily Locked</h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">
              Too many failed authentication attempts. Please wait 5 minutes before trying again.
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Attempts: {securityMetrics.authAttempts}/3</p>
            {securityMetrics.lastAttempt && (
              <p>Last attempt: {securityMetrics.lastAttempt.toLocaleTimeString()}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show error/not authenticated
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center p-8 max-w-md mx-4 bg-white rounded-xl shadow-lg border">
        <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Error:</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Security Requirements:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Access via official Telegram application required</li>
              <li>• Valid authentication credentials needed</li>
              <li>• Secure connection must be established</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={retryAuth}
            disabled={isLockedOut}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Retry Authentication
          </button>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Environment: {isTelegramEnvironment ? 'Telegram' : 'Browser'}<br/>
            Security Level: {securityMetrics.securityLevel}<br/>
            Attempts: {securityMetrics.authAttempts}/3
          </div>
        </div>
      </div>
    </div>
  );
}