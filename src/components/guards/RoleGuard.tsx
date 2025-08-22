
import { ReactNode } from 'react';
import { sessionManager } from '@/utils/SessionManager';
import { Crown, Shield, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: 'admin' | 'user';
  fallback?: ReactNode;
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const currentUser = sessionManager.getCurrentUser();
  const hasRequiredRole = sessionManager.hasPermission(requiredRole);

  console.log('🔍 RoleGuard check:', {
    requiredRole,
    currentUserId: currentUser?.telegram_id,
    hasRequiredRole
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be logged in to access this area.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Refresh & Login
          </button>
        </div>
      </div>
    );
  }

  if (!hasRequiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            {requiredRole === 'admin' ? (
              <Crown className="h-10 w-10 text-orange-600" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {requiredRole === 'admin' ? 'Admin Access Required' : 'Insufficient Permissions'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {requiredRole === 'admin' 
              ? 'This area is restricted to administrators only.'
              : `You don't have the required ${requiredRole} permissions to access this area.`
            }
          </p>
          
          <div className="text-sm text-gray-500 mb-8 bg-gray-50 p-4 rounded">
            <p><strong>Your ID:</strong> {currentUser.telegram_id}</p>
            <p><strong>Required Role:</strong> {requiredRole}</p>
          </div>
          
          <button
            onClick={() => window.location.hash = '#/dashboard'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
