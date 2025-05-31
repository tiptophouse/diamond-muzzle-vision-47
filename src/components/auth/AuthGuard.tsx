
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, error, refreshAuth, isTelegramEnvironment } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-diamond-50 to-diamond-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-diamond-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-diamond-700 font-medium">Connecting to Telegram...</p>
          <p className="text-diamond-500 text-sm mt-2">Please wait while we authenticate your session</p>
        </div>
      </div>
    );
  }

  if (!isTelegramEnvironment) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-red-600" />
            </div>
            <CardTitle className="text-red-800">Telegram Required</CardTitle>
            <CardDescription className="text-red-600">
              This app can only be accessed through Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-red-700">
              Please open this application through:
            </p>
            <ul className="text-sm text-red-600 space-y-1">
              <li>• A Telegram bot command</li>
              <li>• Telegram Mini App menu</li>
              <li>• Direct link from Telegram</li>
            </ul>
            <div className="pt-4 border-t border-red-200">
              <p className="text-xs text-red-500">
                If you believe this is an error, please contact support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
        <Card className="w-full max-w-md border-yellow-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-yellow-600" />
            </div>
            <CardTitle className="text-yellow-800">Authentication Required</CardTitle>
            <CardDescription className="text-yellow-600">
              {error || 'Please authorize the application to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-yellow-700 space-y-2">
              <p>To use Diamond Muzzle Vision:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Ensure you started the app from Telegram</li>
                <li>Grant necessary permissions when prompted</li>
                <li>Wait for authentication to complete</li>
              </ol>
            </div>
            <Button onClick={refreshAuth} className="w-full bg-yellow-600 hover:bg-yellow-700">
              Retry Authentication
            </Button>
            <div className="text-xs text-yellow-500 text-center">
              Having trouble? Make sure you opened this app through Telegram
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
