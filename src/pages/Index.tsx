
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';

const Index = () => {
  const { user, isAuthenticated } = useTelegramAuth();
  const { trackPageVisit } = useUserTracking();

  useEffect(() => {
    // Track the index page visit
    trackPageVisit('/', 'Diamond Muzzle - Home');
  }, [trackPageVisit]);

  // If user is admin, show admin option
  if (isAuthenticated && user?.id === 2138564172) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Admin
          </h1>
          <p className="text-xl text-gray-600 mb-8">Choose your destination</p>
          
          <div className="space-y-4">
            <a 
              href="#/admin" 
              className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              🎯 Admin Analytics Dashboard
            </a>
            <a 
              href="#/" 
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              💎 Regular Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // For regular users, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
