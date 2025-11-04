import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramDeepLink } from '@/hooks/useTelegramDeepLink';

/**
 * Component to handle Telegram start parameters for deep linking
 * Supports: 
 * - Diamond links: start=diamond_<stockNumber>
 * - Page navigation: start=page_<pageName>
 */
export function StartParamInitializer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useTelegramAuth();
  
  // Handle deep link navigation
  useTelegramDeepLink();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleStartParam = () => {
      try {
        const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        
        if (!startParam) return;

        console.log('🔗 Start parameter detected:', startParam);

        // Handle diamond deep links: start=diamond_ABC123
        if (startParam.startsWith('diamond_')) {
          const stockNumber = startParam.replace('diamond_', '');
          console.log('💎 Navigating to diamond:', stockNumber);
          navigate(`/diamond/${stockNumber}`);
        }
        
        // Page navigation is now handled by useTelegramDeepLink hook
      } catch (error) {
        console.error('Error handling start param:', error);
      }
    };

    // Delay to ensure app is ready
    const timer = setTimeout(handleStartParam, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return null;
}
