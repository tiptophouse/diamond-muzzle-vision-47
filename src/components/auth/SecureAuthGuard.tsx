
import { ReactNode } from 'react';
import { useSecureFastAPIAuthContext } from '@/context/SecureFastAPIAuthContext';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface SecureAuthGuardProps {
  children: ReactNode;
}

export function SecureAuthGuard({ children }: SecureAuthGuardProps) {
  const { isAuthenticated, isLoading, error, isTelegramEnvironment, jwtUserId, user } = useSecureFastAPIAuthContext();

  console.log('🔍 SecureAuthGuard state:', { isAuthenticated, isLoading, error, jwtUserId, user: user?.first_name });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="relative">
            <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-6" />
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Authentication</h3>
          <p className="text-gray-600 text-sm">Verifying your identity...</p>
          <div className="mt-4 text-xs text-gray-500">
            <p>🔐 JWT Authentication</p>
            <p>🏢 Diamond Industry Security</p>
            <p>🛡️ Complete User Isolation</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated (which should rarely happen now with fallbacks)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border border-red-200">
          <div className="rounded-full w-20 h-20 bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Issue</h2>
          
          <p className="text-gray-600 mb-6">
            {error || 'Unable to authenticate. Please try refreshing the app.'}
          </p>
          
          <div className="text-sm text-gray-500 mb-8 space-y-1">
            <p>Telegram Environment: {isTelegramEnvironment ? '✅ Yes' : '❌ No'}</p>
            <p>Authentication Status: {isAuthenticated ? '✅ Valid' : '❌ Invalid'}</p>
            <p>User ID: {jwtUserId || 'Not available'}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('🔄 Refreshing for re-authentication');
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
            >
              Refresh App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Successfully authenticated - show the app
  console.log('✅ SecureAuthGuard - User authenticated, showing app');
  return <>{children}</>;
}
