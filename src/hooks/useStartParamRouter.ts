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
      } else if (startParam.startsWith('story_')) {
        // Pattern: story_<stockNumber>
        const stockNumber = startParam.replace('story_', '');
        
        console.log('📖 Routing to story view:', { stockNumber });
        
        // Route to public diamond page with story indicator
        const queryParams = new URLSearchParams();
        queryParams.set('shared', 'true');
        queryParams.set('from', 'story');
        
        navigate(`/public/diamond/${stockNumber}?${queryParams.toString()}`);
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam.startsWith('auction_')) {
        // Pattern: auction_<auctionId>
        const auctionId = startParam.replace('auction_', '');
        
        console.log('🔨 Routing to auction:', { auctionId });
        
        // Route to public auction page
        const queryParams = new URLSearchParams();
        queryParams.set('shared', 'true');
        
        navigate(`/public/auction/${auctionId}?${queryParams.toString()}`);
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam === 'notifications') {
        // Pattern: notifications
        console.log('🔔 Routing to notifications page');
        
        navigate('/notifications');
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam === 'store') {
        // Pattern: store
        console.log('🏪 Routing to store page');
        
        navigate('/store');
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam === 'dashboard') {
        // Pattern: dashboard
        console.log('📊 Routing to dashboard');
        
        navigate('/dashboard');
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam.startsWith('store_')) {
        // Pattern: store_<userId>
        const userId = startParam.replace('store_', '');
        
        console.log('🏪 Routing to seller store:', { userId });
        
        navigate(`/store?seller=${userId}`);
        
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