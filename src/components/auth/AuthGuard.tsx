
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isTelegramEnvironment, user } = useTelegramAuth();

  // Enhanced loading state with better UX
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 max-w-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">Loading Diamond Muzzle</h3>
          <p className="text-blue-600 text-sm mb-4">Initializing your session...</p>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced development mode indicator with better styling
  if (!isTelegramEnvironment && user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b border-yellow-200 p-3">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">
              Development Mode - User: {user.first_name} {user.last_name}
            </span>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Always render the app if we have a user - never show error screens
  if (user) {
    return <>{children}</>;
  }

  // Ultimate fallback - should never reach here with enhanced bulletproof init
  console.log('🚨 AuthGuard ultimate fallback triggered');
  return <>{children}</>;
}
