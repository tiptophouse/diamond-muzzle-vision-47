
import { ReactNode } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
import { Shield, Smartphone, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TelegramOnlyGuardProps {
  children: ReactNode;
}

export function TelegramOnlyGuard({ children }: TelegramOnlyGuardProps) {
  const {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated,
    accessDeniedReason
  } = useStrictTelegramAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Verifying Telegram Access...</h3>
          <p className="text-blue-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Access denied - show appropriate message based on reason
  if (!isAuthenticated || accessDeniedReason) {
    const getAccessDeniedContent = () => {
      switch (accessDeniedReason) {
        case 'not_telegram_environment':
          return {
            icon: <Smartphone className="h-12 w-12 text-blue-600" />,
            title: 'Telegram Mini App Only',
            message: 'This application can only be accessed through Telegram Mini App.',
            instructions: [
              'Open Telegram on your mobile device',
              'Search for our bot or use the provided link',
              'Start the Mini App from within Telegram',
              'Do not access via web browser'
            ],
            showTelegramButton: true
          };
        
        case 'no_init_data':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-orange-600" />,
            title: 'Authentication Data Missing',
            message: 'Telegram authentication data is required but not found.',
            instructions: [
              'Close and reopen the Mini App from Telegram',
              'Make sure you\'re using the latest Telegram version',
              'Try restarting Telegram if the issue persists',
              'Contact support if the problem continues'
            ],
            showRefreshButton: true
          };
        
        case 'backend_auth_failed':
          return {
            icon: <Shield className="h-12 w-12 text-red-600" />,
            title: 'Authentication Failed',
            message: 'Unable to verify your identity with our servers.',
            instructions: [
              'Check your internet connection',
              'Try closing and reopening the Mini App',
              'Make sure you\'re logged into Telegram',
              'Contact support if the issue continues'
            ],
            showRefreshButton: true
          };
        
        case 'invalid_user_data':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-orange-600" />,
            title: 'Invalid User Data',
            message: 'The authentication data format is invalid.',
            instructions: [
              'Close and reopen the Mini App',
              'Update Telegram to the latest version',
              'Clear Telegram cache if possible',
              'Contact support if the issue persists'
            ],
            showRefreshButton: true
          };
        
        default:
          return {
            icon: <AlertTriangle className="h-12 w-12 text-gray-600" />,
            title: 'Access Denied',
            message: error || 'Unable to access the application.',
            instructions: [
              'Please restart the app from Telegram',
              'Ensure you\'re using Telegram Mini App',
              'Check your internet connection'
            ],
            showRefreshButton: true
          };
      }
    };

    const content = getAccessDeniedContent();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border">
          <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            {content.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h2>
          <p className="text-gray-600 mb-6">{content.message}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-3">How to Fix:</h4>
            <ul className="text-blue-700 text-sm space-y-2 text-left">
              {content.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            {content.showRefreshButton && (
              <Button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </Button>
            )}
            
            {content.showTelegramButton && (
              <Button
                onClick={() => {
                  // Try to open in Telegram if possible
                  const telegramUrl = `tg://resolve?domain=your_bot_username`;
                  window.open(telegramUrl, '_blank');
                }}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Open in Telegram
              </Button>
            )}
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 border">
              <div className="font-semibold mb-2">Debug Info:</div>
              <div className="space-y-1 text-gray-600">
                <div>Environment: {process.env.NODE_ENV}</div>
                <div>Telegram Env: {isTelegramEnvironment ? 'Yes' : 'No'}</div>
                <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                <div>User ID: {user?.id || 'None'}</div>
                <div>Access Denied Reason: {accessDeniedReason || 'None'}</div>
                <div>Error: {error || 'None'}</div>
                <div>InitData Available: {typeof window !== 'undefined' && window.Telegram?.WebApp?.initData ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User is authenticated - show the app
  return <>{children}</>;
}
