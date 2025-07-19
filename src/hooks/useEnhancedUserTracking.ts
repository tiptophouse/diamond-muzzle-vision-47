
import { useEffect } from 'react';
import { useVisitorTracking } from './useVisitorTracking';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useLocation } from 'react-router-dom';

export function useEnhancedUserTracking() {
  const { trackVisitor } = useVisitorTracking();
  const { user, isAuthenticated } = useTelegramAuth();
  const location = useLocation();

  // Track page visits
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    trackVisitor(currentPath);
  }, [location, trackVisitor]);

  // Track user authentication status changes
  useEffect(() => {
    if (user && isAuthenticated) {
      console.log('🔐 User authenticated:', user.first_name, 'ID:', user.id);
    }
  }, [user, isAuthenticated]);

  return {
    user,
    isAuthenticated
  };
}
