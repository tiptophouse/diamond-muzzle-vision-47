
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Shield, AlertTriangle, Settings } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

const ADMIN_TELEGRAM_ID = 2138564172;

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isTelegramEnvironment } = useTelegramAuth();

  // Reduced loading time to prevent hanging
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <Settings className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Verifying Access</h3>
          <p className="text-gray-600 text-sm">Checking administrator permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!user || user.id !== ADMIN_TELEGRAM_ID) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            This area is restricted to administrators only.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Current User ID: {user?.id || 'Unknown'}
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Required Admin ID: {ADMIN_TELEGRAM_ID}
          </p>
          
          {/* Development helper button */}
          <div className="space-y-3">
            <button
              onClick={() => {
                localStorage.setItem('dev_admin_mode', 'true');
                window.location.reload();
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm mb-2"
            >
              Enable Admin Mode (Dev)
            </button>
            <br />
            <button
              onClick={() => {
                console.log('🔄 Redirecting to dashboard');
                window.location.hash = '#/dashboard';
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin user confirmed - render admin interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-center gap-3 p-4">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900">
            Admin Dashboard - Welcome, {user.first_name} (ID: {user.id})
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
