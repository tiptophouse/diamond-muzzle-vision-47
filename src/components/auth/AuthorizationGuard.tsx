import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Shield, UserX, Clock } from 'lucide-react';

interface AuthorizationGuardProps {
  children: ReactNode;
}

const ADMIN_TELEGRAM_ID = 2138564172;

export function AuthorizationGuard({ children }: AuthorizationGuardProps) {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const { isUserBlocked, isLoading: blockedLoading } = useBlockedUsers();
  const { settings, isLoading: settingsLoading } = useAppSettings();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || blockedLoading || settingsLoading || !user) {
      return;
    }

    // Admin always gets access
    if (user.id === ADMIN_TELEGRAM_ID) {
      setIsAuthorized(true);
      return;
    }

    // Check if user is blocked
    if (isUserBlocked(user.id)) {
      setIsAuthorized(false);
      return;
    }

    // If manual authorization is enabled, only admin can access
    if (settings.manual_authorization_enabled) {
      setIsAuthorized(false);
      return;
    }

    // Otherwise, user is authorized
    setIsAuthorized(true);
  }, [user, isUserBlocked, settings, authLoading, blockedLoading, settingsLoading]);

  // Loading state
  if (authLoading || blockedLoading || settingsLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Checking Authorization</h3>
          <p className="text-gray-600 text-sm">Verifying your access permissions...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    const isBlocked = user && isUserBlocked(user.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            {isBlocked ? (
              <UserX className="h-10 w-10 text-red-600" />
            ) : (
              <Clock className="h-10 w-10 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isBlocked ? 'Access Denied' : 'Authorization Required'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isBlocked 
              ? 'Your access to this application has been restricted by the administrator.'
              : 'This application now requires manual authorization. Please contact the administrator to request access.'
            }
          </p>
          
          <div className="text-sm text-gray-500 mb-8 space-y-1">
            <p>User ID: {user?.id || 'Unknown'}</p>
            <p>Status: {isBlocked ? 'Blocked' : 'Pending Authorization'}</p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              If you believe this is an error, please contact the administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User is authorized
  return <>{children}</>;
}
