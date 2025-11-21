
import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Shield, UserX, Clock, Crown } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface AuthorizationGuardProps {
  children: ReactNode;
}

export function AuthorizationGuard({ children }: AuthorizationGuardProps) {
  const { user, isLoading: authLoading, isTelegramEnvironment } = useTelegramAuth();
  const { isUserBlocked, isLoading: blockedLoading } = useBlockedUsers();
  const { settings, isLoading: settingsLoading } = useAppSettings();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || adminLoading || !user) {
      return;
    }

    console.log('🔍 Authorization check for user:', user.id, 'Is Admin:', isAdmin);

    // Admin always gets access - HIGHEST PRIORITY
    if (isAdmin) {
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
  }, [user, isUserBlocked, settings, authLoading, blockedLoading, settingsLoading, isTelegramEnvironment, isAdmin, adminLoading]);

  // Loading state
  if (authLoading || adminLoading || isAuthorized === null) {
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
    const invalidEnvironment = process.env.NODE_ENV === 'production' && !isTelegramEnvironment;
    const ADMIN_PHONE = '+972548081663'; // Admin contact number
    
    console.log('🚫 Access denied:', { isBlocked, invalidEnvironment, userId: user?.id });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border">
          <div className={`rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 ${
            isBlocked ? 'bg-red-50' : 'bg-orange-50'
          }`}>
            {isBlocked ? (
              <UserX className="h-10 w-10 text-red-600" />
            ) : (
              <Clock className="h-10 w-10 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {invalidEnvironment 
              ? 'Invalid Access Method'
              : isBlocked 
                ? 'Access Blocked' 
                : 'Authorization Required'
            }
          </h2>
          
          {isBlocked ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-base font-semibold mb-3">
                  🚫 Your Access Has Been Suspended
                </p>
                <p className="text-red-700 text-sm leading-relaxed">
                  Your account access has been temporarily blocked. To restore your access, please complete the payment process or contact support.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  💳 Payment Required
                </p>
                <p className="text-blue-700 text-xs">
                  Complete your payment to regain full access to the platform and all its features.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${ADMIN_PHONE}`}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call Support: {ADMIN_PHONE}
                </a>
                
                <p className="text-xs text-gray-600">
                  Contact us to complete payment and restore access
                </p>
              </div>
            </>
          ) : invalidEnvironment ? (
            <>
              <p className="text-gray-600 mb-6">
                This application must be accessed through the official Telegram application for security reasons.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
                >
                  Refresh & Retry
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                This application now requires manual authorization. Please contact the administrator to request access.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
                >
                  Refresh & Retry
                </button>
                <a
                  href={`tel:${ADMIN_PHONE}`}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Contact Support
                </a>
              </div>
            </>
          )}
          
          <div className="text-xs text-gray-500 mt-6 pt-4 border-t">
            <p>User ID: {user?.id || 'Unknown'}</p>
          </div>
        </div>
      </div>
    );
  }

  // User is authorized
  return <>{children}</>;
}
