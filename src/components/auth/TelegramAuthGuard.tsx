
import { ReactNode } from 'react';
import { useSecureTelegramAuth } from '@/hooks/useSecureTelegramAuth';
import { AdminOTPLogin } from './AdminOTPLogin';
import { Shield, Smartphone, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';

interface TelegramAuthGuardProps {
  children: ReactNode;
}

export function TelegramAuthGuard({ children }: TelegramAuthGuardProps) {
  const {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated
  } = useSecureTelegramAuth();

  console.log('🔍 TelegramAuthGuard - Auth state:', { 
    user: user, 
    isAuthenticated,
    isTelegramEnvironment,
    isLoading
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Checking Authentication...</h3>
          <p className="text-blue-600 text-sm">Verifying Telegram access...</p>
        </div>
      </div>
    );
  }

  // If coming from Telegram and authenticated, allow access
  if (isTelegramEnvironment && isAuthenticated && user) {
    console.log('✅ TelegramAuthGuard - Telegram user authenticated, granting access');
    return <>{children}</>;
  }

  // If coming from Telegram but not authenticated, show login
  if (isTelegramEnvironment && !isAuthenticated) {
    console.log('🔐 TelegramAuthGuard - Telegram environment but not authenticated, showing login');
    return <AdminOTPLogin />;
  }

  // If NOT from Telegram, block access completely
  if (!isTelegramEnvironment) {
    console.log('❌ TelegramAuthGuard - Not from Telegram environment, blocking access');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border">
          <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="h-10 w-10 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Telegram Mini App Only</h2>
          <p className="text-gray-600 mb-6">This application can only be accessed through Telegram Mini App.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-3">How to Access:</h4>
            <ul className="text-blue-700 text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Open Telegram on your mobile device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Search for our bot or use the provided link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Start the Mini App from within Telegram</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Do not access via web browser</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={() => {
              const telegramUrl = `tg://resolve?domain=your_bot_username`;
              window.open(telegramUrl, '_blank');
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            Open in Telegram
          </button>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return <AdminOTPLogin />;
}
