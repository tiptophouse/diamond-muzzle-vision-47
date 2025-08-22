
import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Shield, AlertTriangle, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TelegramInitDataGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallbackComponent?: ReactNode;
}

export function TelegramInitDataGuard({ 
  children, 
  requireAuth = true,
  fallbackComponent 
}: TelegramInitDataGuardProps) {
  const { user, isAuthenticated, isLoading, error, isTelegramEnvironment } = useTelegramAuth();
  const [securityCheck, setSecurityCheck] = useState<{
    passed: boolean;
    reason?: string;
    canRetry: boolean;
  }>({ passed: false, reason: '', canRetry: true });

  useEffect(() => {
    const performSecurityCheck = () => {
      console.log('🛡️ TelegramInitDataGuard: Performing security check');
      
      // Allow loading state
      if (isLoading) {
        return;
      }

      // Development environment bypass (with warning)
      if (process.env.NODE_ENV === 'development' && !requireAuth) {
        console.warn('⚠️ Development mode: Bypassing Telegram auth requirement');
        setSecurityCheck({ passed: true, reason: 'dev-bypass', canRetry: false });
        return;
      }

      // Check Telegram environment
      if (!isTelegramEnvironment && requireAuth) {
        console.error('❌ Not in Telegram environment');
        setSecurityCheck({ 
          passed: false, 
          reason: 'not-telegram', 
          canRetry: false 
        });
        return;
      }

      // Check authentication
      if (!isAuthenticated && requireAuth) {
        console.error('❌ User not authenticated');
        setSecurityCheck({ 
          passed: false, 
          reason: 'not-authenticated', 
          canRetry: true 
        });
        return;
      }

      // Validate InitData freshness for Telegram users
      if (isTelegramEnvironment && typeof window !== 'undefined') {
        const tg = window.Telegram?.WebApp;
        if (tg?.initData) {
          try {
            const urlParams = new URLSearchParams(tg.initData);
            const authDate = urlParams.get('auth_date');
            
            if (authDate) {
              const authDateTime = parseInt(authDate) * 1000;
              const now = Date.now();
              const maxAge = 24 * 60 * 60 * 1000; // 24 hours
              
              if (now - authDateTime > maxAge) {
                console.error('❌ InitData too old');
                setSecurityCheck({ 
                  passed: false, 
                  reason: 'initdata-expired', 
                  canRetry: true 
                });
                return;
              }
            }
          } catch (error) {
            console.error('❌ InitData validation failed:', error);
            setSecurityCheck({ 
              passed: false, 
              reason: 'initdata-invalid', 
              canRetry: true 
            });
            return;
          }
        }
      }

      // All checks passed
      console.log('✅ Security check passed');
      setSecurityCheck({ passed: true, reason: 'authenticated', canRetry: false });
    };

    performSecurityCheck();
  }, [isLoading, isAuthenticated, isTelegramEnvironment, user, requireAuth]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Verifying Access...</h3>
          <p className="text-muted-foreground text-sm">Validating Telegram authentication...</p>
        </div>
      </div>
    );
  }

  // Security check failed
  if (!securityCheck.passed) {
    // Use custom fallback if provided
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    const getSecurityMessage = () => {
      switch (securityCheck.reason) {
        case 'not-telegram':
          return {
            icon: <Smartphone className="h-12 w-12 text-primary" />,
            title: 'Telegram Mini App Only',
            message: 'This application can only be accessed through Telegram Mini App.',
            instructions: [
              'Open Telegram on your mobile device',
              'Search for our bot or use the provided link',
              'Start the Mini App from within Telegram'
            ],
            showRefresh: false
          };
        
        case 'not-authenticated':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
            title: 'Authentication Required',
            message: 'Please authenticate through Telegram to access this content.',
            instructions: [
              'Make sure you\'re logged into Telegram',
              'Try restarting the Mini App',
              'Contact support if the issue persists'
            ],
            showRefresh: true
          };
        
        case 'initdata-expired':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
            title: 'Session Expired',
            message: 'Your Telegram session has expired. Please restart the app.',
            instructions: [
              'Close the Mini App completely',
              'Reopen from Telegram',
              'Your session will be refreshed automatically'
            ],
            showRefresh: true
          };
        
        case 'initdata-invalid':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
            title: 'Invalid Session Data',
            message: 'The session data is corrupted or invalid.',
            instructions: [
              'Try restarting the Mini App',
              'Make sure you\'re using the latest Telegram version',
              'Contact support if the problem continues'
            ],
            showRefresh: true
          };
        
        default:
          return {
            icon: <Shield className="h-12 w-12 text-muted-foreground" />,
            title: 'Access Denied',
            message: error || 'Unable to verify your access permissions.',
            instructions: ['Please try again'],
            showRefresh: true
          };
      }
    };

    const securityMessage = getSecurityMessage();

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              {securityMessage.icon}
            </div>
            <CardTitle className="text-xl">{securityMessage.title}</CardTitle>
            <CardDescription>{securityMessage.message}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-3">How to resolve:</h4>
              <ul className="text-muted-foreground text-sm space-y-2">
                {securityMessage.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {securityMessage.showRefresh && securityCheck.canRetry && (
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="text-xs bg-muted p-3 rounded">
                <summary className="font-semibold cursor-pointer">Debug Info</summary>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <div>Environment: {process.env.NODE_ENV}</div>
                  <div>Telegram Env: {isTelegramEnvironment ? 'Yes' : 'No'}</div>
                  <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                  <div>User ID: {user?.id || 'None'}</div>
                  <div>Security Reason: {securityCheck.reason}</div>
                  <div>Error: {error || 'None'}</div>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Security check passed - render children
  return <>{children}</>;
}
