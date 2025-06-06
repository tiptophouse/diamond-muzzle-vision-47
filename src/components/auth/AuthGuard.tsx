
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { AlertTriangle, RefreshCw, Bug, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isTelegramEnvironment, user, error, refreshAuth } = useTelegramAuth();

  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 max-w-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">Loading Diamond Muzzle</h3>
          <p className="text-blue-600 text-sm mb-4">Extracting Telegram user data...</p>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if in Telegram but authentication failed
  if (isTelegramEnvironment && error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Telegram Data Error</CardTitle>
            <CardDescription>
              {error || "Unable to extract user data from Telegram"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 mb-2">
                <Bug className="inline w-4 h-4 mr-1" />
                Debug Info:
              </p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• In Telegram: {isTelegramEnvironment ? 'Yes' : 'No'}</li>
                <li>• User ID: {user?.id || 'None'}</li>
                <li>• User Name: {user?.first_name} {user?.last_name}</li>
                <li>• Error: {error}</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 text-center">
              The app needs your real Telegram user data. Please try refreshing.
            </p>
            <Button onClick={refreshAuth} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Data Extraction
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success indicator for real users in Telegram
  if (isTelegramEnvironment && user && user.id !== 2138564172) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200 p-3">
          <div className="flex items-center justify-center gap-2 text-green-800">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">
              Real User: {user.first_name} {user.last_name} (ID: {user.id})
            </span>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Development mode indicator for non-Telegram environment or mock users
  if ((!isTelegramEnvironment || user?.id === 2138564172) && user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b border-yellow-200 p-3">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">
              {isTelegramEnvironment ? 'Test Mode' : 'Development Mode'} - User: {user.first_name} {user.last_name} (ID: {user.id})
            </span>
            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Always render the app if we have any authenticated user
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Ultimate fallback
  console.log('🚨 AuthGuard ultimate fallback triggered');
  return <>{children}</>;
}
