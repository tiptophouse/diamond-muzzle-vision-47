
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';

const ADMIN_TELEGRAM_ID = 2138564172;

const Index = () => {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const { trackPageVisit } = useUserTracking();
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    if (!hasTracked) {
      try {
        trackPageVisit('/', 'Diamond Muzzle - Home');
        setHasTracked(true);
      } catch (error) {
        console.warn('Failed to track page visit:', error);
        setHasTracked(true); // Don't block the app for tracking failures
      }
    }
  }, [trackPageVisit, hasTracked]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 max-w-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">Loading Diamond Muzzle</h3>
          <p className="text-blue-600 text-sm">Initializing your session...</p>
        </div>
      </div>
    );
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
            <a 
              href="#/admin" 
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎯 Admin Control Panel
              <div className="text-sm opacity-90 mt-1">Lightweight user management</div>
            </a>
            <a 
              href="#/" 
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              💎 Regular Dashboard
              <div className="text-sm opacity-90 mt-1">Standard user interface</div>
            </a>
          </div>
          
          <div className="text-sm text-gray-500 mt-6">
            Verified admin: {user.first_name} {user.last_name}
          </div>
        </div>
      </div>
    );
  }

  // For regular users, always show the dashboard
  return <Navigate to="/" replace />;
};

export default Index;
