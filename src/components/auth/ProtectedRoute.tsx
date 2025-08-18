
import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isTelegramEnvironment } = useTelegramAuth();
  const [securityCheck, setSecurityCheck] = useState<'checking' | 'approved' | 'denied'>('checking');
  const [denialReason, setDenialReason] = useState<string>('');

  useEffect(() => {
    const performSecurityCheck = async () => {
      console.log('🔒 ProtectedRoute security check starting...');
      
      // Wait for auth to complete
      if (isLoading) {
        console.log('⏳ Still loading authentication...');
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('❌ User not authenticated');
        setDenialReason('Authentication required');
        setSecurityCheck('denied');
        return;
      }

      // Production environment security check
      if (process.env.NODE_ENV === 'production' && !isTelegramEnvironment) {
        console.log('❌ Production requires Telegram environment');
        setDenialReason('This application must be accessed through Telegram Mini App');
        setSecurityCheck('denied');
        return;
      }

      // Admin check if required
      if (requireAdmin) {
        const ADMIN_TELEGRAM_ID = 2138564172;
        if (user.id !== ADMIN_TELEGRAM_ID) {
          console.log('❌ Admin access required but user is not admin');
          setDenialReason('Administrator privileges required');  
          setSecurityCheck('denied');
          return;
        }
      }

      // Log security audit
      try {
        await fetch('/api/security-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'route_access',
            user_id: user.id,
            route: window.location.pathname,
            requireAdmin,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.warn('⚠️ Failed to log security audit:', error);
      }

      console.log('✅ Security check passed');
      setSecurityCheck('approved');
    };

    performSecurityCheck();
  }, [user, isAuthenticated, isLoading, isTelegramEnvironment, requireAdmin]);

  // Loading state
  if (isLoading || securityCheck === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Verification</h3>
          <p className="text-gray-600 text-sm">Verifying your access permissions...</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Authenticating...</span>
          </div>
        </div>
      </div>
    );
  }

  // Access denied
  if (securityCheck === 'denied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{denialReason}</p>
          
          <div className="text-sm text-gray-500 mb-8 space-y-1">
            <p>User ID: {user?.id || 'Unknown'}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>Telegram: {isTelegramEnvironment ? 'Yes' : 'No'}</p>
            <p>Admin Required: {requireAdmin ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                toast.info('Redirecting to authentication...');
                window.location.href = '/';
              }}
              className="w-full"
            >
              Return to Login
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                console.log('🔄 Refreshing for security re-check');
                window.location.reload();
              }}
              className="w-full"
            >
              Retry Authentication
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Access approved - show protected content
  return <>{children}</>;
}
