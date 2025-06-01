
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

const ADMIN_TELEGRAM_ID = 2138564172;

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isTelegramEnvironment } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-red-700 mb-3">Verifying Admin Access</h3>
          <p className="text-red-600 text-sm">Authenticating via Telegram initData...</p>
        </div>
      </div>
    );
  }

  // Check if user is the admin
  if (!user || user.id !== ADMIN_TELEGRAM_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600 mb-6">
            This admin panel is restricted to authorized administrators only.
          </p>
          <p className="text-sm text-red-500 mb-6">
            Current user ID: {user?.id || 'Not authenticated'}
          </p>
          <button
            onClick={() => window.location.href = '#/'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Admin verified - show admin panel
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-red-100 to-red-200 border-b border-red-300 p-3">
        <div className="flex items-center justify-center gap-3 text-red-800">
          <Shield className="h-5 w-5" />
          <span className="font-semibold">
            🔐 ADMIN PANEL - Welcome, {user.first_name}
          </span>
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      {children}
    </div>
  );
}
