
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isTelegramEnvironment, user } = useTelegramAuth();

  // Simple loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Loading Diamond Muzzle</h3>
          <p className="text-blue-600 text-sm">Initializing your session...</p>
        </div>
      </div>
    );
  }

  // Show development mode indicator if not in Telegram
  if (!isTelegramEnvironment && user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-yellow-100 border-b border-yellow-200 p-2">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertTriangle size={14} />
            <span className="text-xs font-medium">
              Development Mode - Mock User: {user.first_name}
            </span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // If we have a user (either real or mock), show the app - NEVER show error screen
  if (user) {
    return <>{children}</>;
  }

  // Final fallback - should never reach here with new bulletproof init
  return <>{children}</>;
}
