
import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useUserTracking } from '@/hooks/useUserTracking';

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
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

  // For all authenticated users (including admin), redirect directly to dashboard
  if (isAuthenticated && user) {
    redirectHandledRef.current = true;
    return <Navigate to="/dashboard" replace />;
  }

  // This should not happen with centralized auth, but just in case
  return <Navigate to="/dashboard" replace />;
};

export default Index;
