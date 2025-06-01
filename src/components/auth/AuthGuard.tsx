
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, error, refreshAuth, isTelegramEnvironment, user } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Loading Diamond Muzzle</h3>
          <p className="text-blue-600 text-sm">Please wait while we initialize your session...</p>
        </div>
      </div>
    );
  }

  // Show development mode indicator if not in Telegram but we have a user
  if (!isTelegramEnvironment && user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-yellow-100 border-b border-yellow-200 p-3">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">
              Development Mode - Using mock user: {user.first_name} (ID: {user.id})
            </span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // If we have a user (either real or mock), show the app
  if (user && !error) {
    return <>{children}</>;
  }

  // Error state with retry options
  if (error || (!isTelegramEnvironment && !user)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={40} className="text-red-600" />
            </div>
            <CardTitle className="text-red-800 text-xl">Failed to Load MazalBot</CardTitle>
            <CardDescription className="text-red-600">
              {error || 'Unable to initialize the application'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-700 space-y-3">
              <p className="font-medium">Troubleshooting steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li>Make sure you opened this app through Telegram</li>
                <li>Check your internet connection</li>
                <li>Try refreshing the application</li>
                <li>If the problem persists, restart Telegram</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={refreshAuth} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RotateCcw size={16} className="mr-2" />
                Retry Connection
              </Button>
              
              {!isTelegramEnvironment && (
                <Button 
                  onClick={refreshAuth} 
                  variant="outline"
                  className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  Try Development Mode
                </Button>
              )}
            </div>
            
            <div className="pt-4 border-t border-red-200">
              <p className="text-xs text-red-500 text-center">
                If you continue having issues, please contact support through Telegram
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Final fallback - should rarely reach here
  return fallback || (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Initializing...</CardTitle>
          <CardDescription>Setting up your Diamond Muzzle experience</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={refreshAuth} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
