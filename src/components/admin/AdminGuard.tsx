
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, AlertTriangle, Star } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

const ADMIN_TELEGRAM_ID = 2138564172;

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isTelegramEnvironment } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-bg particle-bg flex items-center justify-center">
        <div className="text-center p-8 glass-card rounded-2xl max-w-md mx-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500/30 border-t-cyan-400 mx-auto mb-6"></div>
            <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold cosmic-text mb-4">🦄 Accessing Cosmic Portal</h3>
          <p className="text-cyan-300 text-sm mb-4">Verifying unicorn-level clearance...</p>
          <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is the admin
  if (!user || user.id !== ADMIN_TELEGRAM_ID) {
    return (
      <div className="min-h-screen cosmic-bg particle-bg flex items-center justify-center">
        <div className="text-center p-8 glass-card rounded-2xl max-w-md mx-4">
          <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 neon-glow">
            <AlertTriangle className="h-12 w-12 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold cosmic-text mb-4">🔮 Access Restricted</h2>
          <p className="text-cyan-300 mb-6">
            This cosmic realm is reserved for unicorn administrators only.
          </p>
          <p className="text-sm text-purple-300 mb-8">
            Current user ID: {user?.id || 'Unknown entity'}
          </p>
          <button
            onClick={() => window.location.href = '#/'}
            className="cosmic-button w-full"
          >
            🌟 Return to Main Universe
          </button>
        </div>
      </div>
    );
  }

  // Admin verified - show cosmic admin panel
  return (
    <div className="min-h-screen cosmic-bg">
      <div className="gradient-border sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center justify-center gap-3 p-4 text-white">
          <Star className="h-6 w-6 text-purple-400 animate-pulse" />
          <span className="font-bold cosmic-text text-lg">
            🦄 COSMIC ADMIN PORTAL - Welcome, {user.first_name}
          </span>
          <div className="h-3 w-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      {children}
    </div>
  );
}
