
import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

const Index = () => {
  const { user, isAuthenticated, isLoading, error } = useTelegramAuth();
  const { trackPageVisit } = useUserTracking();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const redirectHandledRef = useRef(false);
  const [showFallback, setShowFallback] = useState(false);

  console.log('🏠 Index page rendered with state:', {
    user: user?.id,
    isAuthenticated,
    isLoading,
    loadingConfig,
    error,
    redirectHandled: redirectHandledRef.current
  });

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

  // Show fallback after 5 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading || loadingConfig) {
        console.log('🚨 Showing fallback due to timeout');
        setShowFallback(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading, loadingConfig]);

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
      `Redirect Handled: ${redirectHandledRef.current}`,
      `Error: ${error || 'none'}`,
      `Show Fallback: ${showFallback}`
    ];
    setDebugInfo(info);
    console.log('🔍 Index Debug Info:', info);
  }, [user, isAuthenticated, isLoading, adminTelegramId, loadingConfig, error, showFallback]);

  useEffect(() => {
    if (!isLoading && !loadingConfig && !redirectHandledRef.current) {
      trackPageVisit('/', 'Diamond Muzzle - Home');
    }
  }, [trackPageVisit, isLoading, loadingConfig]);

  // If there's an error or timeout, show emergency interface
  if (error || showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-red-700">Authentication Issue</h1>
            <p className="text-red-600">
              {error || 'Loading timeout - Click below to access the app'}
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Go to Admin Panel
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Reload App
            </button>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 max-h-40 overflow-y-auto">
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
          
          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: loadingConfig ? '30%' : '70%' }}></div>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 max-h-32 overflow-y-auto">
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
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

  // Final fallback for any remaining edge cases
  console.log('🔄 No clear auth state - showing manual navigation');
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
          <p className="text-xl text-gray-600">Welcome to your diamond management app</p>
        </div>
        
        {/* Manual navigation buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Enter Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Admin Panel
          </button>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Refresh App
        </button>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 max-h-32 overflow-y-auto">
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
