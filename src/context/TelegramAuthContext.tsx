
import React, { createContext, useContext, ReactNode } from 'react';
import { useSecureTelegramAuth } from '@/hooks/useSecureTelegramAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Smartphone, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  phone_number?: string;
}

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  jwtToken: string | null;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

function AuthErrorScreen({ error, isTelegramEnvironment }: { error: string; isTelegramEnvironment: boolean }) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            {!isTelegramEnvironment ? (
              <Smartphone className="text-red-600 h-8 w-8" />
            ) : (
              <AlertTriangle className="text-red-600 h-8 w-8" />
            )}
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-red-600">
              {!isTelegramEnvironment ? 'Telegram Required' : 'Authentication Failed'}
            </CardTitle>
            <CardDescription className="mt-2">
              {!isTelegramEnvironment 
                ? 'This application only works within Telegram'
                : 'Unable to verify your Telegram identity'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          
          {!isTelegramEnvironment ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Open in Telegram</p>
                  <p className="text-xs text-blue-700">This app must be accessed through Telegram</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Wifi className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Check Connection</p>
                  <p className="text-xs text-amber-700">Ensure stable internet connection</p>
                </div>
              </div>
              
              <Button 
                onClick={handleRefresh} 
                className="w-full" 
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Authenticating</CardTitle>
            <CardDescription>Verifying your Telegram identity...</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-700">Connecting to secure server</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <p className="text-sm text-slate-600">Validating Telegram data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const authState = useSecureTelegramAuth();
  
  console.log('🔍 TelegramAuthProvider - Auth state:', { 
    user: authState.user, 
    isAuthenticated: authState.isAuthenticated,
    isTelegramEnvironment: authState.isTelegramEnvironment,
    isLoading: authState.isLoading,
    hasError: !!authState.error
  });

  // Show loading screen while authenticating
  if (authState.isLoading) {
    return <AuthLoadingScreen />;
  }

  // Show error screen if authentication failed
  if (authState.error || !authState.isAuthenticated) {
    return (
      <AuthErrorScreen 
        error={authState.error || 'Authentication required'} 
        isTelegramEnvironment={authState.isTelegramEnvironment}
      />
    );
  }

  return (
    <TelegramAuthContext.Provider value={{
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      error: authState.error,
      isTelegramEnvironment: authState.isTelegramEnvironment,
      jwtToken: authState.jwtToken,
    }}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}
