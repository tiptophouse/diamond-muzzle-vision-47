
import { ReactNode } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
import { Shield, Smartphone, ExternalLink, RefreshCw, AlertTriangle, Ban } from 'lucide-react';

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
          <p className="text-blue-600 text-sm">Strict authentication in progress...</p>
        </div>
      </div>
    );
  }

  // Access denied - show appropriate message based on reason
  if (!isAuthenticated || accessDeniedReason) {
    const getAccessDeniedContent = () => {
      switch (accessDeniedReason) {
        case 'not_telegram':
          return {
            icon: <Ban className="h-12 w-12 text-red-600" />,
            title: 'Access Blocked',
            message: 'This application is ONLY accessible through Telegram Mini App. Web browser access is not permitted.',
            instructions: [
              'Open Telegram on your mobile device',
              'Search for our bot',
              'Start the Mini App from within Telegram',
              'Web browser access is strictly prohibited'
            ],
            showTelegramButton: true,
            severity: 'error'
          };
        
        case 'invalid_telegram_data':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-orange-600" />,
            title: 'Invalid Telegram Authentication',
            message: 'The Telegram authentication data is invalid, expired, or tampered with.',
            instructions: [
              'Close and reopen the Mini App in Telegram',
              'Make sure you\'re using the latest version of Telegram',
              'Do not attempt to access via web browser',
              'Contact support if the issue persists'
            ],
            showRefreshButton: true,
            severity: 'warning'
          };
        
        case 'authentication_failed':
          return {
            icon: <Shield className="h-12 w-12 text-red-600" />,
            title: 'Authentication Failed',
            message: 'Unable to verify your Telegram identity with our secure backend.',
            instructions: [
              'Ensure you\'re logged into Telegram',
              'Try closing and reopening the Mini App',
              'Make sure you have a stable internet connection',
              'Contact support if the issue continues'
            ],
            showRefreshButton: true,
            severity: 'error'
          };
        
        case 'timeout':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-orange-600" />,
            title: 'Authentication Timeout',
            message: 'Authentication took too long to complete.',
            instructions: [
              'Check your internet connection',
              'Try refreshing the Mini App',
              'Make sure Telegram has proper network access'
            ],
            showRefreshButton: true,
            severity: 'warning'
          };
        
        default:
          return {
            icon: <Ban className="h-12 w-12 text-red-600" />,
            title: 'Access Denied',
            message: 'Access to this application is strictly limited to authenticated Telegram users only.',
            instructions: [
              'Use Telegram Mini App only',
              'Ensure proper Telegram authentication',
              'Web browser access is not permitted'
            ],
            showRefreshButton: true,
            severity: 'error'
          };
      }
    };

    const content = getAccessDeniedContent();
    const borderColor = content.severity === 'error' ? 'border-red-200' : 'border-orange-200';
    const bgColor = content.severity === 'error' ? 'bg-red-50' : 'bg-orange-50';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className={`text-center p-8 bg-white rounded-xl shadow-xl max-w-md w-full border-2 ${borderColor}`}>
          <div className={`${bgColor} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6`}>
            {content.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h2>
          <p className="text-gray-600 mb-6 font-medium">{content.message}</p>
          
          <div className={`${bgColor} border ${content.severity === 'error' ? 'border-red-200' : 'border-orange-200'} rounded-lg p-4 mb-6`}>
            <h4 className={`font-medium mb-3 ${content.severity === 'error' ? 'text-red-800' : 'text-orange-800'}`}>
              Required Steps:
            </h4>
            <ul className={`text-sm space-y-2 text-left ${content.severity === 'error' ? 'text-red-700' : 'text-orange-700'}`}>
              {content.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className={`font-bold mt-0.5 ${content.severity === 'error' ? 'text-red-600' : 'text-orange-600'}`}>•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            {content.showRefreshButton && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Retry Authentication
              </button>
            )}
            
            {content.showTelegramButton && (
              <button
                onClick={() => {
                  // Try to open in Telegram if possible
                  const telegramUrl = `tg://resolve?domain=MazalBotSupport`;
                  window.open(telegramUrl, '_blank');
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Open in Telegram
              </button>
            )}
          </div>
          
          {/* Security notice */}
          <div className="mt-6 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600">
              🔒 <strong>Security Notice:</strong> This application uses strict Telegram-only authentication 
              to protect user data and ensure secure access.
            </p>
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
                <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                <div>In Iframe: {window.self !== window.top ? 'Yes' : 'No'}</div>
                <div>Has InitData: {!!window.Telegram?.WebApp?.initData ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User is authenticated via strict Telegram verification - show the app
  console.log('✅ Access granted to authenticated Telegram user:', user?.first_name);
  return <>{children}</>;
}
