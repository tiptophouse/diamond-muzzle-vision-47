import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';
import { getAdminTelegramId } from '@/lib/api/secureConfig';
import { Diamond } from 'lucide-react';
const Index = () => {
  const {
    user,
    isAuthenticated,
    isLoading
  } = useTelegramAuth();
  const {
    trackPageVisit
  } = useUserTracking();
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
    const info = [`Loading: ${isLoading}`, `Config Loading: ${loadingConfig}`, `Authenticated: ${isAuthenticated}`, `User ID: ${user?.id || 'none'}`, `User Name: ${user?.first_name || 'none'}`, `Admin ID: ${adminTelegramId || 'loading...'}`, `Telegram Env: ${!!window.Telegram?.WebApp}`, `URL: ${window.location.href}`, `Redirect Handled: ${redirectHandledRef.current}`];
    setDebugInfo(info);
    console.log('🔍 Index Debug Info:', info);
  }, [user, isAuthenticated, isLoading, adminTelegramId, loadingConfig]);
  useEffect(() => {
    if (!isLoading && !loadingConfig && !redirectHandledRef.current) {
      trackPageVisit('/', 'BrilliantBot - Home');
    }
  }, [trackPageVisit, isLoading, loadingConfig]);

  // Show loading state while auth is initializing - Mobile optimized
  if (isLoading || loadingConfig) {
    return <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center space-y-6 w-full max-w-xs">
          {/* Compact mobile loader */}
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-border animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Diamond className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          {/* Mobile-optimized typography */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              BrilliantBot
            </h1>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {loadingConfig ? 'Loading...' : 'AI-powered diamond trading'}
            </p>
            
            {/* Compact loading dots */}
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 rounded-full bg-primary/30 animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>;
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

  // For regular users, redirect to dashboard to see their data
  if (isAuthenticated && user) {
    console.log('✅ Regular user detected - redirecting to dashboard');
    redirectHandledRef.current = true;
    return <Navigate to="/dashboard" replace />;
  }

  // Fallback for unauthenticated users - Mobile optimized
  return <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center space-y-6 w-full max-w-xs">
        {/* Compact mobile icon */}
        <div className="mx-auto w-14 h-14 rounded-xl bg-card border flex items-center justify-center">
          <Diamond className="w-7 h-7 text-primary" />
        </div>
        
        {/* Mobile typography */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            BrilliantBot
          </h1>
          <p className="text-sm text-muted-foreground">
            Secure Telegram access required
          </p>
        </div>
        
        {/* Compact mobile info */}
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">🔐 Telegram Only</p>
            <p>This app works within Telegram Mini App for security.</p>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full min-h-[44px] px-4 py-3 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/90 transition-colors touch-manipulation active:scale-95"
          >
            🔄 Retry Authentication
          </button>
        </div>
      </div>
    </div>;
};
export default Index;