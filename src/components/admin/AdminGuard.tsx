
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, AlertTriangle, Sparkles, Star } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

const ADMIN_TELEGRAM_ID = 2138564172;

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isTelegramEnvironment } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent cosmic-gradient mx-auto mb-6 neon-glow"></div>
            <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold cosmic-text mb-3 floating-animation">
            🦄 Accessing Unicorn Portal
          </h3>
          <p className="text-purple-200 text-sm mb-4">Authenticating cosmic credentials...</p>
          <div className="w-64 bg-slate-700 rounded-full h-2 mx-auto">
            <div className="cosmic-gradient h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.id !== ADMIN_TELEGRAM_ID) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="glass-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 neon-glow">
            <AlertTriangle className="h-10 w-10 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold cosmic-text mb-4">Access Denied</h2>
          <p className="text-purple-200 mb-6">
            This cosmic admin portal is restricted to authorized unicorn administrators only.
          </p>
          <p className="text-sm text-purple-300 mb-6">
            Current entity ID: {user?.id || 'Unknown being'}
          </p>
          <button
            onClick={() => window.location.href = '#/'}
            className="glass-card text-white px-6 py-3 rounded-lg hover:neon-glow transition-all duration-300 cosmic-border"
          >
            Return to Main Realm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="cosmic-flow border-b border-purple-500/30 p-3">
        <div className="flex items-center justify-center gap-3 text-white">
          <Sparkles className="h-5 w-5 sparkle" />
          <span className="font-bold text-lg">
            🦄 UNICORN ADMIN PORTAL - Welcome, {user.first_name}
          </span>
          <div className="h-2 w-2 bg-cyan-400 rounded-full pulse-glow"></div>
        </div>
      </div>
      <div className="cosmic-bg min-h-screen">
        {children}
      </div>
    </div>
  );
}
