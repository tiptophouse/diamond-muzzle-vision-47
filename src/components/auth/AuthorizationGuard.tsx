
import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Shield, UserX, Clock, Crown } from 'lucide-react';
import { getFirstAdminTelegramId } from '@/lib/secureAdmin';

interface AuthorizationGuardProps {
  children: ReactNode;
}

export function AuthorizationGuard({ children }: AuthorizationGuardProps) {
  const { user, isLoading: authLoading, isTelegramEnvironment } = useTelegramAuth();
  const { isUserBlocked, isLoading: blockedLoading } = useBlockedUsers();
  const { settings, isLoading: settingsLoading } = useAppSettings();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);

  useEffect(() => {
    const loadAdminId = async () => {
      const adminId = await getFirstAdminTelegramId();
      setAdminTelegramId(adminId);
    };
    loadAdminId();
  }, []);

  useEffect(() => {
    if (authLoading || !user || adminTelegramId === null) {
      return;
    }

    console.log('🔍 Authorization check for user:', user.id, 'Admin ID:', adminTelegramId);

    // Admin always gets access - HIGHEST PRIORITY
    if (user.id === adminTelegramId) {
      console.log('✅ Admin user detected - granting IMMEDIATE access');
      setIsAuthorized(true);
      return;
    }

    // Wait for blocked users data to load - CRITICAL CHECK
    if (blockedLoading) {
      console.log('⏳ Waiting for blocked users data...');
      return;
    }

    // CRITICAL: Check if user is blocked FIRST - before any other checks
    if (isUserBlocked(user.id)) {
      console.log('🚫 BLOCKED USER DETECTED - DENYING ALL ACCESS:', user.id);
      setIsAuthorized(false);
      return;
    }

    // Wait for settings to load for other checks
    if (settingsLoading) {
      return;
    }

    // Enhanced security: verify environment in production for non-admin users
    if (process.env.NODE_ENV === 'production' && !isTelegramEnvironment) {
      console.log('❌ Production requires Telegram environment for non-admin users');
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
  }, [user, isUserBlocked, settings, authLoading, blockedLoading, settingsLoading, isTelegramEnvironment, adminTelegramId]);

  // Loading state
  if (authLoading || isAuthorized === null || adminTelegramId === null) {
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
    const isAdminUser = user && user.id === adminTelegramId;
    const invalidEnvironment = process.env.NODE_ENV === 'production' && !isTelegramEnvironment;
    
    console.log('🚫 Access denied:', { isBlocked, isAdminUser, invalidEnvironment, userId: user?.id });
    
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
            {invalidEnvironment 
              ? 'Invalid Access Method'
              : isBlocked 
                ? 'Access Denied' 
                : 'Authorization Required'
            }
          </h2>
          
          <p className="text-gray-600 mb-6">
            {invalidEnvironment
              ? 'This application must be accessed through the official Telegram application for security reasons.'
              : isBlocked 
                ? 'Your account has been blocked by the administrator. If you believe this is an error, please contact support.'
                : 'This application now requires manual authorization. Please contact the administrator to request access.'
            }
          </p>
          
          {isBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm font-medium">
                🚫 Account Status: <span className="font-bold">BLOCKED</span>
              </p>
              <p className="text-red-700 text-xs mt-2">
                All access to the platform has been revoked. Contact the administrator for assistance.
              </p>
            </div>
          )}
          
          <div className="text-sm text-gray-500 mb-8 space-y-1">
            <p>User ID: {user?.id || 'Unknown'}</p>
            <p>Status: {invalidEnvironment ? 'Invalid Environment' : isBlocked ? 'Blocked' : 'Pending Authorization'}</p>
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
