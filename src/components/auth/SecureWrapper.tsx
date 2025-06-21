
import React, { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useSecureUserData } from '@/hooks/useSecureUserData';
import { Shield, ShieldX, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SecureWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  showTelegramId?: boolean; // Only true for admin components
}

export function SecureWrapper({ 
  children, 
  requireAuth = true, 
  showTelegramId = false 
}: SecureWrapperProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { isUserValid, isLoading: validationLoading } = useSecureUserData();

  // Show loading state
  if (authLoading || validationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Securing Your Session</h3>
                <p className="text-sm text-gray-600">Validating your Telegram authentication...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show authentication required message
  if (requireAuth && (!isAuthenticated || !isUserValid)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <ShieldX className="h-12 w-12 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Authentication Required</h3>
                <p className="text-sm text-red-600">
                  Please ensure you're accessing this app through the official Telegram bot.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Retry Authentication
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Security wrapper for content
  return (
    <div className="relative">
      {/* Security indicator for authenticated users */}
      {isAuthenticated && isUserValid && (
        <div className="fixed top-4 right-4 z-50 hidden sm:block">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <Shield className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Secure Session</span>
            {showTelegramId && user && (
              <span className="text-xs text-green-600">ID: {user.id}</span>
            )}
          </div>
        </div>
      )}
      
      {/* Render children with security context */}
      {children}
    </div>
  );
}
