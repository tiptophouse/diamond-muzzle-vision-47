import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useDiamondShareAnalytics } from './useDiamondShareAnalytics';

/**
 * Hook to handle Telegram start_param routing and analytics
 * Parses deep link parameters and routes users to the correct pages
 */
export function useStartParamRouter() {
  const navigate = useNavigate();
  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    if (!webApp) return;

    // Get start_param from Telegram WebApp (fix type issue)
    const startParam = (webApp as any)?.initDataUnsafe?.start_param;
    
    if (!startParam) return;

    console.log('🔗 Processing start_param:', startParam);

    try {
      // Parse different start param patterns
      if (startParam.startsWith('diamond_')) {
        // Pattern: diamond_<stockNumber>_<ownerTelegramId>
        const parts = startParam.split('_');
        if (parts.length >= 2) {
          const stockNumber = parts[1];
          const ownerId = parts[2] || null;
          
          console.log('💎 Routing to diamond:', { stockNumber, ownerId });
          
          // Route to public diamond page with tracking params
          const queryParams = new URLSearchParams();
          queryParams.set('shared', 'true');
          if (ownerId) {
            queryParams.set('from', ownerId);
            queryParams.set('verify', 'true');
          }
          
          navigate(`/public/diamond/${stockNumber}?${queryParams.toString()}`);
          
          // Haptic feedback
          if (webApp.HapticFeedback) {
            webApp.HapticFeedback.impactOccurred('light');
          }
        }
      } else if (startParam.startsWith('store_')) {
        // Pattern: store_<ownerTelegramId>
        const ownerId = startParam.replace('store_', '');
        
        console.log('🏪 Routing to store:', { ownerId });
        
        // Route to catalog with seller filter
        const queryParams = new URLSearchParams();
        queryParams.set('seller', ownerId);
        queryParams.set('shared', 'true');
        
        navigate(`/?${queryParams.toString()}`);
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      }

    } catch (error) {
      console.error('❌ Error processing start_param:', error);
    }
  }, [webApp, navigate]);

  return {
    // Helper function to manually process a start param (for testing)
    processStartParam: (param: string) => {
      console.log('🔧 Manual start param processing:', param);
      // Could implement manual processing logic here if needed
    }
  };
}