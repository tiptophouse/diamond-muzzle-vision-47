/**
 * Blocking full-screen error displayed when Telegram initData is missing
 * or authentication fails due to environment issues
 */

interface BlockingAuthErrorProps {
  error: string;
  reason: string | null;
}

export function BlockingAuthError({ error, reason }: BlockingAuthErrorProps) {
  const isInitDataIssue = reason === 'no_init_data' || reason === 'invalid_init_data';
  const isTelegramIssue = reason === 'not_telegram_environment';

  return (
    <div className="fixed inset-0 bg-destructive text-destructive-foreground flex items-center justify-center p-8 z-50">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl mb-4">⚠️</div>
        
        <h1 className="text-2xl font-bold">
          {isTelegramIssue && 'Not Running in Telegram'}
          {isInitDataIssue && 'Authentication Data Missing'}
          {!isTelegramIssue && !isInitDataIssue && 'Authentication Failed'}
        </h1>
        
        <p className="text-lg">
          {isTelegramIssue && 'This app must be opened through the Telegram Mini App.'}
          {isInitDataIssue && 'Required authentication data is missing or invalid. Please reopen the app through Telegram.'}
          {!isTelegramIssue && !isInitDataIssue && error}
        </p>

        <div className="mt-6 p-4 bg-background/10 rounded-lg text-left">
          <p className="text-sm font-mono">
            <strong>Error Code:</strong> {reason || 'unknown'}
          </p>
          <p className="text-sm font-mono mt-2">
            <strong>initData Present:</strong> {window.Telegram?.WebApp?.initData ? 'YES' : 'NO'}
          </p>
          <p className="text-sm font-mono mt-2">
            <strong>initData Length:</strong> {window.Telegram?.WebApp?.initData?.length || 0}
          </p>
          <p className="text-sm font-mono mt-2">
            <strong>User ID:</strong> {window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'NOT AVAILABLE'}
          </p>
          <p className="text-sm font-mono mt-2">
            <strong>Location:</strong> {window.location.href}
          </p>
        </div>

        <div className="mt-6 text-sm opacity-80">
          <p>If this error persists, please contact support with the error code above.</p>
        </div>
      </div>
    </div>
  );
}
