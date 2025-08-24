
import { ReactNode } from 'react';
import { useOptimizedTelegramAuth } from '@/hooks/useOptimizedTelegramAuth';
import { Shield, Smartphone, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

interface StrictTelegramGuardProps {
  children: ReactNode;
}

export function StrictTelegramGuard({ children }: StrictTelegramGuardProps) {
  const {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated
  } = useOptimizedTelegramAuth();

  // CRITICAL: Block any non-Telegram environment immediately
  const isRealTelegramEnvironment = () => {
    if (typeof window === 'undefined') return false;
    
    // Check 1: Must have Telegram WebApp object
    if (!window.Telegram?.WebApp) {
      console.error('🔒 BLOCKED: No Telegram WebApp object detected');
      return false;
    }
    
    // Check 2: Must have non-empty initData
    if (!window.Telegram.WebApp.initData || window.Telegram.WebApp.initData.length === 0) {
      console.error('🔒 BLOCKED: No initData found - not genuine Telegram environment');
      return false;
    }
    
    // Check 3: Validate initData structure
    try {
      const urlParams = new URLSearchParams(window.Telegram.WebApp.initData);
      const hash = urlParams.get('hash');
      const authDate = urlParams.get('auth_date');
      const user = urlParams.get('user');
      
      if (!hash || !authDate || !user) {
        console.error('🔒 BLOCKED: Invalid initData structure');
        return false;
      }
      
      // Check 4: Validate auth_date freshness (5 minutes max)
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (now - authDateTime > maxAge) {
        console.error('🔒 BLOCKED: initData too old, possible replay attack');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔒 BLOCKED: Error validating initData:', error);
      return false;
    }
  };

  // Immediate environment check - no delays, no loading states
  const realTelegramCheck = isRealTelegramEnvironment();
  
  // If not in real Telegram environment, block immediately
  if (!realTelegramCheck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border border-red-200">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-12 w-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            Access Denied
          </h2>
          
          <p className="text-red-700 mb-6">
            This application ONLY works within the official Telegram Mini App environment. 
            Access from web browsers or external sources is strictly prohibited.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-800 mb-3">Security Requirements:</h4>
            <ul className="text-red-700 text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>Must be accessed through Telegram Mobile App</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>Requires valid Telegram WebApp initData</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>NO web browser access allowed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>NO external website access permitted</span>
              </li>
            </ul>
          </div>
          
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200">
            🔒 STRICT SECURITY MODE: Only genuine Telegram Mini App access allowed
          </div>
        </div>
      </div>
    );
  }

  // Loading state (only after Telegram environment is confirmed)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Verifying Telegram Access...</h3>
          <p className="text-blue-600 text-sm">Strict security validation in progress...</p>
        </div>
      </div>
    );
  }

  // Authentication failed
  if (!isAuthenticated || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Failed
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error || 'Unable to verify your Telegram identity through the secure authentication process.'}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-3">Try these steps:</h4>
            <ul className="text-blue-700 text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Make sure you're logged into Telegram</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Close and reopen the Mini App</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Restart Telegram if issue persists</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
            🔒 STRICT TELEGRAM-ONLY AUTHENTICATION ACTIVE
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated - show the app
  return <>{children}</>;
}
