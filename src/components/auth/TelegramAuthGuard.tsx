
import React from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { Loader2, Shield, Smartphone } from 'lucide-react';

interface TelegramAuthGuardProps {
  children: React.ReactNode;
}

export function TelegramAuthGuard({ children }: TelegramAuthGuardProps) {
  const { user, isAuthenticated, isLoading, error } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <Shield className="absolute inset-0 h-6 w-6 m-auto text-primary/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Authenticating...</h3>
            <p className="text-sm text-muted-foreground">Verifying Telegram credentials</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Smartphone className="h-8 w-8 text-destructive" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-muted-foreground">
              This application requires Telegram Mini App access
            </p>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <h4 className="font-medium text-foreground">How to access:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Open Telegram app</li>
              <li>• Navigate to our bot</li>
              <li>• Launch the Mini App</li>
              <li>• Do not use web browser</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Successfully authenticated
  return <>{children}</>;
}
