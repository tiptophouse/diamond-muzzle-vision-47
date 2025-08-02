
import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useTelegramSendData } from './useTelegramSendData';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useSecureDiamondSharing() {
  const { webApp, user } = useTelegramWebApp();
  const { sendData } = useTelegramSendData();

  const createSecureShareData = useCallback((diamond: Diamond) => {
    // Create secure data payload that only works in Telegram
    return {
      type: 'diamond_share',
      diamond: {
        id: diamond.id,
        stockNumber: diamond.stockNumber,
        carat: diamond.carat,
        shape: diamond.shape,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        price: diamond.price,
        imageUrl: diamond.imageUrl,
        gem360Url: diamond.gem360Url
      },
      sharedBy: user?.id,
      timestamp: Date.now(),
      miniAppUrl: window.location.origin
    };
  }, [user]);

  const trackShareClick = useCallback(async (diamondId: string, sharedBy: number) => {
    try {
      await supabase.from('diamond_share_analytics').insert({
        diamond_stock_number: diamondId,
        owner_telegram_id: sharedBy,
        viewer_telegram_id: user?.id,
        viewer_user_agent: navigator.userAgent,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        session_id: crypto.randomUUID(),
        shared_click: true
      });
      
      console.log('✅ Share click tracked for diamond:', diamondId);
    } catch (error) {
      console.error('❌ Failed to track share click:', error);
    }
  }, [user]);

  const shareWithInlineButtons = useCallback(async (diamond: Diamond) => {
    if (!webApp || !user) {
      toast.error('Telegram Mini App required for sharing');
      return false;
    }

    try {
      const shareData = createSecureShareData(diamond);
      
      // Create the share message with inline buttons
      const shareMessage = {
        action: 'share_diamond_with_buttons',
        data: {
          diamond: shareData.diamond,
          message: `💎 *${diamond.carat} ct ${diamond.shape} Diamond*\n\n` +
                  `🎨 Color: ${diamond.color}\n` +
                  `💎 Clarity: ${diamond.clarity}\n` +
                  `✂️ Cut: ${diamond.cut}\n` +
                  `💰 Price: $${diamond.price?.toLocaleString() || 'Contact for Price'}\n\n` +
                  `Stock: ${diamond.stockNumber}`,
          inline_keyboard: [
            [
              {
                text: '👀 View Details',
                web_app: {
                  url: `${window.location.origin}/diamond/${diamond.id}?shared=true&from=${user.id}`
                }
              }
            ],
            [
              {
                text: '🏪 Browse More Diamonds',
                web_app: {
                  url: `${window.location.origin}/store?shared=true&from=${user.id}`
                }
              }
            ],
            [
              {
                text: '📞 Contact Seller',
                callback_data: `contact_seller_${diamond.stockNumber}_${user.id}`
              }
            ]
          ]
        },
        timestamp: Date.now()
      };

      // Send via Telegram WebApp
      const success = sendData(shareMessage);
      
      if (success) {
        // Track the share action
        await supabase.from('diamond_share_analytics').insert({
          diamond_stock_number: diamond.stockNumber,
          owner_telegram_id: user.id,
          viewer_telegram_id: null, // Will be filled when someone clicks
          action_type: 'share_initiated',
          session_id: crypto.randomUUID()
        });

        toast.success('💎 Diamond shared with inline buttons!');
        return true;
      } else {
        throw new Error('Failed to send share data');
      }
    } catch (error) {
      console.error('❌ Failed to share diamond:', error);
      toast.error('Failed to share diamond. Please try again.');
      return false;
    }
  }, [webApp, user, createSecureShareData, sendData]);

  return {
    shareWithInlineButtons,
    trackShareClick,
    isAvailable: !!(webApp && user)
  };
}
