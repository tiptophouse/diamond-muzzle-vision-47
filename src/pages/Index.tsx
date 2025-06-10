
import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useUserTracking } from '@/hooks/useUserTracking';

const Index = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { trackPageVisit } = useUserTracking();
  const redirectHandledRef = useRef(false);

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
        </div>
      </div>
    );
  }

  // Prevent multiple redirects
  if (redirectHandledRef.current) {
    return null;
  }

  // If user is admin, show admin selection
  if (isAuthenticated && isAdmin) {
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
                window.location.hash = '#/admin';
              }} 
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎯 Admin Control Panel
              <div className="text-sm opacity-90 mt-1">Full user management system</div>
            </button>
            <button 
              onClick={() => {
                redirectHandledRef.current = true;
                window.location.hash = '#/dashboard';
              }} 
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              💎 Regular Dashboard
              <div className="text-sm opacity-90 mt-1">Standard user interface</div>
            </button>
            <button 
              onClick={() => {
                redirectHandledRef.current = true;
                window.location.hash = '#/advertisement';
              }} 
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              📢 Advertisement Page
              <div className="text-sm opacity-90 mt-1">Lead capture landing page</div>
            </button>
          </div>
          
          <div className="text-sm text-gray-500 mt-6">
            Verified admin: {user?.first_name} {user?.last_name}
          </div>
        </div>
      </div>
    );
  }

  // For regular users, redirect to dashboard
  if (isAuthenticated && user) {
    redirectHandledRef.current = true;
    return <Navigate to="/dashboard" replace />;
  }

  // This should not happen with centralized auth, but just in case
  return <Navigate to="/dashboard" replace />;
};

export default Index;
