
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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-12 max-w-2xl animate-fade-in">
          {/* Clean, minimal loader */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-muted animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Diamond className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          {/* Large, clean typography like 21.dev */}
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight leading-none">
              BrilliantBot
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-normal leading-relaxed max-w-xl mx-auto">
              {loadingConfig ? 'Loading configuration...' : 'Equipping diamond traders with AI-powered tools for tomorrow\'s market'}
            </p>
            
            {/* Minimal status indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-left bg-card p-4 rounded-lg border shadow-soft max-w-md mx-auto">
              <div className="font-semibold mb-2 text-foreground">Debug Info:</div>
              {debugInfo.map((info, i) => (
                <div key={i} className="text-muted-foreground">{info}</div>
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
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-12 max-w-2xl">
        {/* Clean icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-card border shadow-soft flex items-center justify-center">
          <Diamond className="w-10 h-10 text-primary" />
        </div>
        
        {/* Large, clean typography */}
        <div className="space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight leading-none">
            BrilliantBot
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-normal leading-relaxed">
            Loading your personalized diamond trading experience
          </p>
        </div>
        
        {/* Clean button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-soft hover:shadow-medium hover:-translate-y-0.5"
        >
          Manual Refresh
        </button>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-left bg-card p-4 rounded-lg border shadow-soft max-w-md mx-auto">
            <div className="font-semibold mb-2 text-foreground">Debug Info:</div>
            {debugInfo.map((info, i) => (
              <div key={i} className="text-muted-foreground">{info}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
