
import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

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
      trackPageVisit('/', 'Diamond Muzzle - Home');
    }
  }, [trackPageVisit, isLoading, loadingConfig]);

  // Show loading state while auth is initializing
  if (isLoading || loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-blue-700">Diamond Muzzle</h1>
            <p className="text-blue-600">
              {loadingConfig ? 'Loading configuration...' : 'Initializing your session...'}
            </p>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="space-y-4">
          <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <span className="text-3xl">💎</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Diamond Muzzle
          </h1>
          <p className="text-xl text-gray-600">Loading your personalized experience...</p>
        </div>
        
        {/* Emergency manual refresh button */}
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
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
