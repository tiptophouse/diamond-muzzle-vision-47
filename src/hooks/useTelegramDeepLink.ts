import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Handle deep links from Telegram inline buttons
 * Format: ?startapp=diamond_STOCK123
 */
export function useTelegramDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDeepLink = () => {
      if (typeof window === 'undefined') return;

      const tg = (window as any).Telegram?.WebApp;
      if (!tg) return;

      // Get start parameter from Telegram
      const startParam = tg.initDataUnsafe?.start_param;
      
      if (startParam?.startsWith('diamond_')) {
        const stockNumber = startParam.replace('diamond_', '');
        console.log('🔗 Deep link to diamond:', stockNumber);
        
        // Navigate to inventory page with stock number filter
        navigate(`/inventory?stock=${encodeURIComponent(stockNumber)}`);
      }
    };

    handleDeepLink();

    // Listen for Telegram WebApp ready event
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.ready) {
      tg.ready();
      handleDeepLink();
    }
  }, [navigate]);
}
