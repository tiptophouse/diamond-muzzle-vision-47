
import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Shield, UserX, Crown } from 'lucide-react';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

interface AuthorizationGuardProps {
  children: ReactNode;
}

export function AuthorizationGuard({ children }: AuthorizationGuardProps) {
  const { user, isLoading: authLoading, isTelegramEnvironment } = useTelegramAuth();
  const { isUserBlocked, isLoading: blockedLoading } = useBlockedUsers();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);

  useEffect(() => {
    const loadAdminId = async () => {
      const adminId = await getAdminTelegramId();
      setAdminTelegramId(adminId);
    };
    loadAdminId();
  }, []);

  useEffect(() => {
    if (authLoading || !user || adminTelegramId === null) {
      return;
    }

    console.log('🔍 Authorization check for user:', user.id, 'Admin ID:', adminTelegramId);

    // Wait for blocked users data to load
    if (blockedLoading) {
      return;
    }

    // Check if user is blocked - this applies to ALL users including admin
    if (isUserBlocked(user.id)) {
      console.log('❌ User is blocked');
      setIsAuthorized(false);
      return;
    }

    // All authenticated, non-blocked users get access
    console.log('✅ User authorized - authenticated and not blocked');
    setIsAuthorized(true);
  }, [user, isUserBlocked, authLoading, blockedLoading, adminTelegramId]);

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

  // Not authorized - only blocked users
  if (!isAuthorized) {
    const isBlocked = user && isUserBlocked(user.id);
    const isAdminUser = user && user.id === adminTelegramId;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className={`rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 ${
            isAdminUser ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            {isAdminUser ? (
              <Crown className="h-10 w-10 text-yellow-600" />
            ) : (
              <UserX className="h-10 w-10 text-red-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          
          <p className="text-gray-600 mb-6">
            Your access to this application has been restricted by the administrator.
          </p>
          
          <div className="text-sm text-gray-500 mb-8 space-y-1">
            <p>User ID: {user?.id || 'Unknown'}</p>
            <p>Status: Blocked</p>
            {isAdminUser && <p className="text-yellow-600 font-medium">⚠️ Admin user is blocked</p>}
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

  // User is authorized - all authenticated, non-blocked users get access
  return <>{children}</>;
}
