
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTelegramWebApp } from './useTelegramWebApp';

export function useSecureNavigation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { backButton } = useTelegramWebApp();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const shared = searchParams.get('shared');
    const locked = searchParams.get('locked');
    const from = searchParams.get('from');

    if (shared === 'true' && locked === 'true' && from) {
      setIsLocked(true);
      console.log('🔒 Navigation locked - secure share mode active');

      // Override browser back button for locked navigation
      const handlePopState = (event: PopStateEvent) => {
        event.preventDefault();
        // Stay on current page or redirect to share source
        window.history.pushState(null, '', window.location.href);
      };

      // Add custom back button behavior
      const handleBackClick = () => {
        // Instead of normal navigation, could close or show message
        console.log('🔒 Back navigation blocked in secure mode');
      };

      window.addEventListener('popstate', handlePopState);
      
      // Override Telegram back button if available
      if (backButton) {
        backButton.show(handleBackClick);
      }

      // Push current state to prevent back navigation
      window.history.pushState(null, '', window.location.href);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (backButton) {
          backButton.hide();
        }
      };
    } else {
      setIsLocked(false);
    }
  }, [searchParams, backButton]);

  const canNavigate = (path: string) => {
    if (!isLocked) return true;

    // Allow navigation only within shared content
    const allowedPaths = [
      '/catalog',
      '/diamond/',
      // Add other allowed paths for shared access
    ];

    return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
  };

  const secureNavigate = (path: string) => {
    if (canNavigate(path)) {
      navigate(path);
    } else {
      console.log('🔒 Navigation blocked - path not allowed in secure mode:', path);
    }
  };

  return {
    isLocked,
    canNavigate,
    secureNavigate,
    restrictedMessage: isLocked ? "Navigation is restricted in secure sharing mode" : null
  };
}
