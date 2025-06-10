
import { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';

const ADMIN_TELEGRAM_ID = 2138564172;

const Index = () => {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const { trackPageVisit } = useUserTracking();
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const redirectHandledRef = useRef(false);

  useEffect(() => {
    // Add debug info for troubleshooting
    const info = [
      `Loading: ${isLoading}`,
      `Authenticated: ${isAuthenticated}`,
      `User ID: ${user?.id || 'none'}`,
      `User Name: ${user?.first_name || 'none'}`,
      `Telegram Env: ${!!window.Telegram?.WebApp}`,
      `URL: ${window.location.href}`,
      `Redirect Handled: ${redirectHandledRef.current}`
    ];
    setDebugInfo(info);
    console.log('🔍 Index Debug Info:', info);
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && !redirectHandledRef.current) {
      trackPageVisit('/', 'Diamond Muzzle - Home');
    }
  }, [trackPageVisit, isLoading]);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-blue-700">Diamond Muzzle</h1>
            <p className="text-blue-600">Initializing your session...</p>
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

  // If user is admin, show admin selection
  if (isAuthenticated && user?.id === ADMIN_TELEGRAM_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-purple-50">
        <div className="text-center space-y-8 p-8 max-w-md">
          <div className="space-y-4">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <span className="text-3xl">👑</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Admin
            </h1>
            <p className="text-xl text-gray-600">Choose your destination</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => {
                redirectHandledRef.current = true;
                navigate('/admin');
              }} 
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎯 Admin Control Panel
              <div className="text-sm opacity-90 mt-1">Full user management system</div>
            </button>
            <button 
              onClick={() => {
                redirectHandledRef.current = true;
                navigate('/dashboard');
              }} 
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              💎 Regular Dashboard
              <div className="text-sm opacity-90 mt-1">Standard user interface</div>
            </button>
          </div>
          
          <div className="text-sm text-gray-500 mt-6">
            Verified admin: {user.first_name} {user.last_name}
          </div>
        </div>
      </div>
    );
  }

  // For regular users, redirect to dashboard (only once)
  if (isAuthenticated && user) {
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
