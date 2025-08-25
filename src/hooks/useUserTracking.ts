
import { useEffect, useRef } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useUserTracking() {
  const { isAuthenticated, isLoading } = useTelegramAuth();
  const beforeUnloadHandlerRef = useRef<((event: BeforeUnloadEvent) => void) | null>(null);

  useEffect(() => {
    // Only add beforeunload handler when user is authenticated and not loading
    // This prevents warnings during authentication flow
    if (isAuthenticated && !isLoading) {
      console.log('🔒 Adding beforeunload protection for authenticated user');
      
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        // Only show warning if user has made changes or is in critical operation
        // For now, we'll be conservative and not show warnings in Telegram environment
        const isTelegram = !!(window as any).Telegram?.WebApp;
        
        if (isTelegram) {
          // In Telegram, we typically don't want to show browser warnings
          // as it interferes with the WebApp experience
          return;
        }
        
        // For web environments, you can customize when to show warnings
        event.preventDefault();
        event.returnValue = 'Changes you made may not be saved.';
        return 'Changes you made may not be saved.';
      };

      beforeUnloadHandlerRef.current = handleBeforeUnload;
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        if (beforeUnloadHandlerRef.current) {
          console.log('🔓 Removing beforeunload protection');
          window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
          beforeUnloadHandlerRef.current = null;
        }
      };
    } else {
      // Remove any existing handler during loading/unauthenticated states
      if (beforeUnloadHandlerRef.current) {
        console.log('🔓 Removing beforeunload protection (user not authenticated)');
        window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
        beforeUnloadHandlerRef.current = null;
      }
    }
  }, [isAuthenticated, isLoading]);

  // Return tracking utilities with the correct method names
  return {
    trackPageView: (page: string) => {
      console.log('📊 Page view:', page);
    },
    trackPageVisit: (page: string, title?: string) => {
      console.log('📊 Page visit:', page, title);
    },
    trackEvent: (event: string, data?: any) => {
      console.log('📊 Event:', event, data);
    }
  };
}
