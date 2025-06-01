
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';

const ADMIN_TELEGRAM_ID = 2138564172;

const Index = () => {
  const { user, isAuthenticated } = useTelegramAuth();
  const { trackPageVisit } = useUserTracking();

  useEffect(() => {
    trackPageVisit('/', 'Diamond Muzzle - Home');
  }, [trackPageVisit]);

  // If user is admin, show admin selection (no reload risks)
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
              onClick={() => window.location.hash = '#/admin'} 
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎯 Admin Control Panel
              <div className="text-sm opacity-90 mt-1">Full user management system</div>
            </button>
            <button 
              onClick={() => window.location.hash = '#/'} 
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

  // For regular users, redirect to dashboard (using React Router, no page reload)
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Safe loading state for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Diamond Muzzle</h1>
        <p className="text-xl text-gray-600">Loading your personalized experience...</p>
      </div>
    </div>
  );
};

export default Index;
