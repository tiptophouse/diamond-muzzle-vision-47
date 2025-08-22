
import { ReactNode, useEffect, useState } from 'react';
import { sessionManager } from '@/utils/SessionManager';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';

interface SessionGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  fallback?: ReactNode;
}

export function SessionGuard({ children, requiredPermission, fallback }: SessionGuardProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateUserSession();
  }, [requiredPermission]);

  const validateUserSession = async () => {
    setIsValidating(true);
    setError(null);

    try {
      console.log('🔐 SessionGuard: Validating session...');
      
      const result = await sessionManager.validateSession();
      
      if (!result.isValid) {
        console.log('❌ SessionGuard: Session invalid:', result.error);
        setIsValid(false);
        setError(result.error || 'Session expired');
        return;
      }

      // Check specific permission if required
      if (requiredPermission && !sessionManager.hasPermission(requiredPermission)) {
        console.log('❌ SessionGuard: Permission denied:', requiredPermission);
        setIsValid(false);
        setError(`Permission denied: ${requiredPermission}`);
        return;
      }

      console.log('✅ SessionGuard: Session valid');
      setIsValid(true);
      
    } catch (error) {
      console.error('❌ SessionGuard: Validation error:', error);
      setError('Session validation failed');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Validating Session</h3>
          <p className="text-gray-600 text-sm">Checking your authentication status...</p>
        </div>
      </div>
    );
  }

  // Invalid session
  if (!isValid) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Expired</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Your session has expired. Please refresh to continue.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                sessionManager.clearSession();
                window.location.reload();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh & Login
            </button>
            
            <button
              onClick={validateUserSession}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 border">
              <div className="font-semibold mb-2">Debug Info:</div>
              <div className="text-gray-600">{error}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Session is valid
  return <>{children}</>;
}
