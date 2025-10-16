import React from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

export function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  const { isAuthenticated, isLoading, error, isTelegramEnvironment, accessDeniedReason } = useTelegramAuth();

  // DEV MODE: Bypass auth in Lovable preview
  const isLovablePreview = window.location.hostname.includes('lovableproject.com');
  const devModeBypass = isLovablePreview || localStorage.getItem('dev_mode') === 'true';

  // Show loading state
  if (isLoading && !devModeBypass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-center bg-card rounded-xl shadow-lg p-8 max-w-md mx-auto border">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Verifying Access</h3>
          <p className="text-muted-foreground text-sm">Authenticating with secure JWT token...</p>
        </div>
      </div>
    );
  }

  // Show access denied for unauthenticated users (unless dev mode)
  if ((!isAuthenticated || error || accessDeniedReason) && !devModeBypass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-center bg-card rounded-xl shadow-lg p-8 max-w-md mx-auto border">
          <div className="bg-destructive/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            {accessDeniedReason === 'not_telegram_environment' 
              ? 'This app only works inside Telegram Mini App environment.'
              : accessDeniedReason === 'no_init_data'
              ? 'Missing Telegram authentication data. Please restart from Telegram.'
              : accessDeniedReason === 'backend_auth_failed'
              ? 'Authentication failed. Please try again from Telegram.'
              : 'You must be authenticated via Telegram to access this content.'}
          </p>
          
          <div className="text-sm text-muted-foreground mb-6 bg-muted/50 p-4 rounded-lg">
            <p><strong>Security Status:</strong> JWT Authentication Required</p>
            <p><strong>Environment:</strong> {isTelegramEnvironment ? 'Telegram Mini App' : 'Browser (Blocked)'}</p>
            {error && <p><strong>Error:</strong> {error}</p>}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            
            {!isTelegramEnvironment && (
              <button
                onClick={() => window.open('https://t.me/diamondmazalbot', '_blank')}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Open in Telegram
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated - render protected content
  return <>{children}</>;
}