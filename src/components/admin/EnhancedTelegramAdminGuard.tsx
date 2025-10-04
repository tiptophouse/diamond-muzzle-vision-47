import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { Shield, AlertTriangle, Settings, Crown, Home, Fingerprint, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { isAdminTelegramId } from '@/lib/secureAdmin';
import { useToast } from '@/hooks/use-toast';

interface EnhancedTelegramAdminGuardProps {
  children: ReactNode;
}

export function EnhancedTelegramAdminGuard({ children }: EnhancedTelegramAdminGuardProps) {
  const { user, isLoading, isTelegramEnvironment, isAuthenticated } = useTelegramAuth();
  const { 
    isInitialized, 
    device, 
    theme, 
    features,
    biometric
  } = useTelegramSDK();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [securityChecks, setSecurityChecks] = useState({
    telegramEnvironment: false,
    biometricAvailable: false,
    deviceVerified: false,
    adminVerified: false
  });

  // Enhanced security verification using Telegram SDK
  useEffect(() => {
    const performSecurityChecks = async () => {
      if (!user?.id || !isTelegramEnvironment) {
        setIsAdminUser(false);
        setIsLoadingAdmin(false);
        return;
      }

      try {
        console.log('🔐 Enhanced Admin Security Check - Starting verification for Telegram ID:', user.id);
        
        // Check 1: Telegram Environment
        const telegramCheck = isTelegramEnvironment && isInitialized;
        console.log('✅ Telegram Environment Check:', telegramCheck);
        
        // Check 2: Admin Status from Database
        const adminStatus = await isAdminTelegramId(user.id);
        console.log('✅ Admin Database Check:', adminStatus);
        
        // Check 3: Device Information Verification
        const deviceInfo = {
          platform: device?.platform,
          version: device?.version,
          colorScheme: theme?.colorScheme
        };
        const deviceCheck = !!(deviceInfo.platform && deviceInfo.version);
        console.log('✅ Device Info Check:', deviceCheck, deviceInfo);
        
        // Check 4: Biometric Availability (optional enhancement)
        let biometricCheck = true; // Default true as not all devices support it
        const biometricAvailable = biometric?.isAvailable() || false;
        if (biometricAvailable) {
          console.log('✅ Biometric Available');
        }

        // Update security checks state
        setSecurityChecks({
          telegramEnvironment: telegramCheck,
          biometricAvailable: biometricAvailable,
          deviceVerified: deviceCheck,
          adminVerified: adminStatus
        });

        // Admin access granted only if all critical checks pass
        const hasAccess = telegramCheck && adminStatus && deviceCheck;
        setIsAdminUser(hasAccess);
        
        if (hasAccess) {
          console.log('🎉 Enhanced Admin Access Granted');
          // Silent login - no haptic feedback on admin entry
          
          toast({
            title: "Admin Access Granted",
            description: `Welcome, ${user.first_name}! Secure admin session initialized.`,
            duration: 2000,
          });
        } else {
          console.log('❌ Enhanced Admin Access Denied');
        }

      } catch (error) {
        console.error('❌ Enhanced Admin Security Check Failed:', error);
        setIsAdminUser(false);
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    performSecurityChecks();
  }, [user?.id, isTelegramEnvironment, isInitialized, biometric, toast]);

  // Loading state with enhanced security indicators
  if (isLoading || isLoadingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Enhanced Security Check</h3>
          <p className="text-gray-600 text-sm mb-4">Verifying Telegram SDK security layers...</p>
          
          {/* Security check indicators */}
          <div className="space-y-2 text-left">
            <div className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${securityChecks.telegramEnvironment ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`}></div>
              Telegram Environment
            </div>
            <div className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${securityChecks.deviceVerified ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`}></div>
              Device Verification
            </div>
            <div className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${securityChecks.adminVerified ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`}></div>
              Admin Authorization
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Telegram authentication required for admin access.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full"
            variant="default"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Enhanced admin verification with detailed security info
  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Enhanced security verification failed. Admin access denied.
          </p>
          
          {/* Enhanced security status */}
          <div className="text-sm bg-gray-50 p-4 rounded mb-6 space-y-2">
            <div className="font-semibold text-gray-700 mb-2">Security Status:</div>
            <div className="flex justify-between">
              <span>Telegram ID:</span>
              <span className="font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className={securityChecks.telegramEnvironment ? 'text-green-600' : 'text-red-600'}>
                {isTelegramEnvironment ? 'Telegram' : 'Browser'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Device:</span>
              <span className={securityChecks.deviceVerified ? 'text-green-600' : 'text-red-600'}>
                {device?.platform || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Admin Status:</span>
              <span className={securityChecks.adminVerified ? 'text-green-600' : 'text-red-600'}>
                {securityChecks.adminVerified ? 'Verified' : 'Denied'}
              </span>
            </div>
            {securityChecks.biometricAvailable && (
              <div className="flex justify-between">
                <span>Biometric:</span>
                <span className="text-blue-600">Available</span>
              </div>
            )}
          </div>
          
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full"
            variant="default"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Success - Render admin dashboard with enhanced header
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Crown className="h-5 w-5 text-yellow-600" />
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-gray-900">
              Secure Admin Dashboard - {user.first_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {securityChecks.biometricAvailable && (
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                <Fingerprint className="h-3 w-3" />
                Biometric
              </div>
            )}
            <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Verified: {user.id}
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}