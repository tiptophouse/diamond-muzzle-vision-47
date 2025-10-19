import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { isAdminTelegramId } from '@/lib/secureAdmin';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedTelegramAdminGuardProps {
  children: ReactNode;
}

export function EnhancedTelegramAdminGuard({ children }: EnhancedTelegramAdminGuardProps) {
  const { user, isLoading, isTelegramEnvironment } = useTelegramAuth();
  const { haptics, webApp } = useEnhancedTelegramWebApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const checkAdminStatus = async () => {
    if (!user?.id) {
      setIsAdminUser(false);
      setIsVerifying(false);
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationError(null);
      console.log('🔐 Checking admin status for:', user.id);
      
      const adminStatus = await isAdminTelegramId(user.id);
      setIsAdminUser(adminStatus);
      
      if (adminStatus) {
        console.log('✅ Admin access granted');
        haptics?.success();
        toast({
          title: "Admin Access Granted",
          description: `Welcome, ${user.first_name}!`,
          duration: 2000,
        });
      } else {
        console.log('❌ Admin access denied');
        haptics?.error();
      }
    } catch (error) {
      console.error('❌ Admin check failed:', error);
      setVerificationError(error instanceof Error ? error.message : 'Verification failed');
      haptics?.error();
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user?.id]);

  // Show verification banner while checking
  if (isVerifying) {
    return (
      <>
        <Alert className="m-4">
          <Shield className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            Verifying admin access...
          </AlertDescription>
        </Alert>
        {children}
      </>
    );
  }

  // Show error banner with retry if verification failed
  if (verificationError) {
    return (
      <>
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Admin verification failed: {verificationError}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={checkAdminStatus}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        {children}
      </>
    );
  }

  // Access denied
  if (isAdminUser === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Admin access is restricted to authorized users only.
          </p>
          <div className="text-sm bg-gray-50 p-4 rounded mb-6">
            <div className="flex justify-between mb-2">
              <span>Telegram ID:</span>
              <span className="font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Environment:</span>
              <span>{isTelegramEnvironment ? 'Telegram' : 'Browser'}</span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Admin access granted - render children
  return <>{children}</>;
}