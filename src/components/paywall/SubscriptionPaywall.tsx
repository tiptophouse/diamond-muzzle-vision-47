import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, CreditCard, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useSubscriptionPaywall } from '@/hooks/useSubscriptionPaywall';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface SubscriptionPaywallProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

export function SubscriptionPaywall({ children, loadingFallback }: SubscriptionPaywallProps) {
  const location = useLocation();
  const { subscriptionStatus, isLoading, isBlocked, requestPaymentLink, refetch } = useSubscriptionPaywall();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  // Public routes that bypass subscription check
  const publicRoutes = [
    '/auctions',
    '/public/auction/',
    '/public/diamond/',
    '/privacy-policy',
    '/diagnostic',
    '/'
  ];

  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

  // Bypass paywall for public routes
  if (isPublicRoute) {
    console.log('🌐 Public route detected, bypassing paywall:', location.pathname);
    return <>{children}</>;
  }

  // Admin bypass - admins always get access
  if (isAdmin) {
    console.log('👑 Admin user detected, bypassing paywall');
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        {loadingFallback || (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Checking subscription status...</p>
          </div>
        )}
      </div>
    );
  }

  // Only block if explicitly no subscription
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="max-w-md w-full shadow-2xl border-destructive/20">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Subscription Required</CardTitle>
              <CardDescription className="text-base">
                Your subscription is inactive. Please subscribe to access the app.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Subscription Status */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <Badge variant="destructive">INACTIVE</Badge>
                </div>
              </div>
              
              {subscriptionStatus?.message && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">{subscriptionStatus.message}</p>
                </div>
              )}
            </div>

            {/* Payment Button */}
            <div className="space-y-3">
              <Button 
                onClick={requestPaymentLink} 
                className="w-full h-12 text-base font-semibold shadow-lg"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Get Payment Link via Telegram
              </Button>
              
              <Button
                onClick={refetch}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Subscription Check
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Click the button to receive a payment link in your Telegram chat
              </p>
            </div>

            {/* Support Info */}
            <div className="pt-4 border-t border-border text-center space-y-2">
              <p className="text-sm font-medium">Need help?</p>
              <a 
                href="tel:+972548081663" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Contact: +972 54-808-1663
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is active, show the app
  return (
    <>
      {children}
    </>
  );
}
