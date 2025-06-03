import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Shield, UserX, Clock, Crown } from 'lucide-react';

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

    console.log('🔍 Authorization check for user:', user.id, 'Admin ID:', ADMIN_TELEGRAM_ID);

    // Admin always gets access - highest priority
    if (user.id === ADMIN_TELEGRAM_ID) {
      console.log('✅ Admin user detected - granting full access');
      setIsAuthorized(true);
      return;
    }

    // Check if user is blocked
    if (isUserBlocked(user.id)) {
      console.log('❌ User is blocked');
      setIsAuthorized(false);
      return;
    }

    // If manual authorization is enabled, only admin can access
    if (settings.manual_authorization_enabled) {
      console.log('⚠️ Manual authorization enabled - denying access to non-admin');
      setIsAuthorized(false);
      return;
    }

    // Otherwise, user is authorized
    console.log('✅ User authorized');
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
          {user && (
            <p className="text-xs text-gray-500 mt-2">User ID: {user.id}</p>
          )}
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    const isBlocked = user && isUserBlocked(user.id);
    const isAdminUser = user && user.id === ADMIN_TELEGRAM_ID;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className={`rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 ${
            isAdminUser ? 'bg-yellow-50' : isBlocked ? 'bg-red-50' : 'bg-orange-50'
          }`}>
            {isAdminUser ? (
              <Crown className="h-10 w-10 text-yellow-600" />
            ) : isBlocked ? (
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
            {isAdminUser && <p className="text-yellow-600 font-medium">⚠️ Admin user detected but authorization failed</p>}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('🔄 Refreshing page for authorization check');
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
            >
              Refresh & Retry
            </button>
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
