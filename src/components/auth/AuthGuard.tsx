
import { ReactNode } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, error, refreshAuth } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diamond-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              {error || 'Please open this app through Telegram to continue.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshAuth} className="w-full">
              Retry Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
