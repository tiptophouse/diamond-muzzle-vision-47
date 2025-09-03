
import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';
import { getAdminTelegramId } from '@/lib/api/secureConfig';
import { Diamond } from 'lucide-react';

const Index = () => {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const { trackPageVisit } = useUserTracking();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const redirectHandledRef = useRef(false);

  useEffect(() => {
    const loadAdminId = async () => {
      try {
        const adminId = await getAdminTelegramId();
        setAdminTelegramId(adminId);
      } catch (error) {
        console.error('Failed to load admin ID:', error);
        setAdminTelegramId(2138564172); // fallback
      } finally {
        setLoadingConfig(false);
      }
    };
    loadAdminId();
  }, []);

  useEffect(() => {
    // Add debug info for troubleshooting
    const info = [
      `Loading: ${isLoading}`,
      `Config Loading: ${loadingConfig}`,
      `Authenticated: ${isAuthenticated}`,
      `User ID: ${user?.id || 'none'}`,
      `User Name: ${user?.first_name || 'none'}`,
      `Admin ID: ${adminTelegramId || 'loading...'}`,
      `Telegram Env: ${!!window.Telegram?.WebApp}`,
      `URL: ${window.location.href}`,
      `Redirect Handled: ${redirectHandledRef.current}`
    ];
    setDebugInfo(info);
    console.log('🔍 Index Debug Info:', info);
  }, [user, isAuthenticated, isLoading, adminTelegramId, loadingConfig]);

  useEffect(() => {
    if (!isLoading && !loadingConfig && !redirectHandledRef.current) {
      trackPageVisit('/', 'BrilliantBot - Home');
    }
  }, [trackPageVisit, isLoading, loadingConfig]);

  // Show loading state while auth is initializing
  if (isLoading || loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-surface)' }}>
        <div className="text-center space-y-8 p-8 max-w-md glass-card animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-premium">
                <Diamond className="text-white h-8 w-8" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary-dark bg-clip-text text-transparent">
              BrilliantBot
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              {loadingConfig ? 'Loading configuration...' : 'Initializing your AI diamond assistant...'}
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="font-medium">Secure • Fast • Reliable</span>
            </div>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4">
              <div className="font-semibold mb-2">Debug Info:</div>
              {debugInfo.map((info, i) => (
                <div key={i} className="text-gray-600">{info}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Prevent multiple redirects
  if (redirectHandledRef.current) {
    return null;
  }

  // If user is admin, redirect directly to admin panel
  if (isAuthenticated && user?.id === adminTelegramId) {
    console.log('✅ Admin user detected - redirecting to admin panel');
    redirectHandledRef.current = true;
    return <Navigate to="/admin" replace />;
  }

  // For regular users, redirect to dashboard
  if (isAuthenticated && user) {
    console.log('✅ Regular user detected - redirecting to dashboard');
    redirectHandledRef.current = true;
    return <Navigate to="/dashboard" replace />;
  }

  // Fallback for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-surface)' }}>
      <div className="text-center space-y-8 p-8 max-w-md glass-card">
        <div className="space-y-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto shadow-premium">
            <Diamond className="text-white h-12 w-12" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary-dark bg-clip-text text-transparent">
            BrilliantBot
          </h1>
          <p className="text-xl text-muted-foreground font-medium">Loading your personalized experience...</p>
        </div>
        
        {/* Emergency manual refresh button */}
        <button
          onClick={() => window.location.reload()}
          className="premium-button"
        >
          Manual Refresh
        </button>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4">
            <div className="font-semibold mb-2">Debug Info:</div>
            {debugInfo.map((info, i) => (
              <div key={i} className="text-gray-600">{info}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
