
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertTriangle, RotateCcw } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, error, refreshAuth, isTelegramEnvironment, user } = useTelegramAuth();

  // Simple loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Loading Diamond Muzzle</h3>
          <p className="text-blue-600 text-sm">Initializing your session...</p>
        </div>
      </div>
    );
  }

  // Show development mode indicator if not in Telegram
  if (!isTelegramEnvironment && user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-yellow-100 border-b border-yellow-200 p-2">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertTriangle size={14} />
            <span className="text-xs font-medium">
              Development Mode - Mock User: {user.first_name}
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

  // Simplified error state - only show if there's actually an error AND no user
  if (error && !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <CardTitle className="text-red-800 text-lg">Connection Error</CardTitle>
            <CardDescription className="text-red-600">
              Unable to initialize MazalBot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-700 space-y-2">
              <p>Please try:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li>Refreshing the app</li>
                <li>Checking your internet connection</li>
                <li>Restarting Telegram if needed</li>
              </ul>
            </div>
            
            <Button 
              onClick={refreshAuth} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RotateCcw size={16} className="mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Final fallback - should rarely reach here
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Initializing...</CardTitle>
          <CardDescription>Setting up Diamond Muzzle</CardDescription>
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
