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

    // Try to get start_param from Telegram WebApp first
    let startParam = (webApp as any)?.initDataUnsafe?.start_param;
    
    // Fallback: check URL query parameters for tgWebAppStartParam
    if (!startParam) {
      const queryParams = new URLSearchParams(window.location.search);
      startParam = queryParams.get('tgWebAppStartParam') || undefined;
    }
    
    if (!startParam) return;

    console.log('🔗 Processing start_param:', startParam);
    
    // Track deep link arrival analytics
    console.log('📊 Deep Link Analytics:', {
      type: 'deep_link_arrival',
      start_param: startParam,
      timestamp: new Date().toISOString(),
      user_id: (webApp as any)?.initDataUnsafe?.user?.id,
      platform: 'telegram_miniapp'
    });

    try {
      // Parse different start param patterns
      if (startParam.startsWith('diamond_')) {
        // Pattern: diamond_<stockNumber>_<ownerTelegramId>
        const parts = startParam.split('_');
        if (parts.length >= 2) {
          const stockNumber = parts[1];
          const ownerId = parts[2] || null;
          
          console.log('💎 Routing to diamond:', { stockNumber, ownerId });
          console.log('📊 Diamond Click Analytics:', { stockNumber, ownerId, source: 'deep_link' });
          
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
      } else if (startParam.startsWith('auction_')) {
        // Pattern: auction_<auctionId>
        const auctionId = startParam.replace('auction_', '');
        
        console.log('🔨 Routing to auction:', { auctionId });
        console.log('📊 Auction Click Analytics:', { auctionId, source: 'deep_link' });
        
        // Route to auction page
        const queryParams = new URLSearchParams();
        queryParams.set('shared', 'true');
        
        navigate(`/auction/${auctionId}?${queryParams.toString()}`);
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('medium');
        }
      } else if (startParam.startsWith('offer_')) {
        // Pattern: offer_<stockNumber>_<ownerTelegramId>
        const parts = startParam.split('_');
        if (parts.length >= 2) {
          const stockNumber = parts[1];
          const ownerId = parts[2] || null;
          
          console.log('💰 Routing to make offer:', { stockNumber, ownerId });
          
          // Route to public diamond offer page
          const queryParams = new URLSearchParams();
          queryParams.set('shared', 'true');
          if (ownerId) {
            queryParams.set('from', ownerId);
          }
          
          navigate(`/public/diamond-offer/${stockNumber}?${queryParams.toString()}`);
          
          // Haptic feedback
          if (webApp.HapticFeedback) {
            webApp.HapticFeedback.impactOccurred('medium');
          }
        }
      } else if (startParam.startsWith('store_')) {
        // Pattern: store_<sellerTelegramId>
        const sellerId = startParam.replace('store_', '');
        
        console.log('🏪 Routing to seller store:', { sellerId });
        
        // Route to catalog filtered by seller
        navigate(`/catalog?seller=${sellerId}`);
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam === 'store') {
        // Pattern: store (general store)
        console.log('🏪 Routing to general store');
        console.log('📊 Store Click Analytics:', { source: 'deep_link', type: 'general_store' });
        
        navigate('/store');
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam === 'dashboard') {
        // Pattern: dashboard
        console.log('📱 Routing to dashboard');
        
        navigate('/dashboard');
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam === 'notifications') {
        // Pattern: notifications
        console.log('🔔 Routing to notifications');
        
        navigate('/notifications');
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
      } else if (startParam.startsWith('ai_')) {
        // Pattern: ai_<stockNumber>
        const stockNumber = startParam.replace('ai_', '');
        
        console.log('🤖 Routing to AI assistant:', { stockNumber });
        
        // Route to chat with context about specific diamond
        navigate(`/chat?diamond=${stockNumber}`);
        
        // Haptic feedback
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
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
        
        // Route to auction page
        const queryParams = new URLSearchParams();
        queryParams.set('shared', 'true');
        
        navigate(`/auction/${auctionId}?${queryParams.toString()}`);
        
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