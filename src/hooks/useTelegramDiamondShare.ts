
import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';

export function useTelegramDiamondShare() {
  const { webApp, user } = useTelegramWebApp();

  const shareDiamondWithInlineKeyboard = useCallback(async (diamond: Diamond, recipientName?: string) => {
    if (!webApp || !user) {
      toast.error('🔒 Telegram Mini App required for sharing');
      return false;
    }

    try {
      // Create the diamond viewing URL
      const diamondUrl = `${window.location.origin}/diamond/${diamond.id}?shared=true&from=${user.id}`;
      
      // Create the professional diamond message
      const diamondMessage = `💎 **${diamond.carat}ct ${diamond.shape} Diamond**\n\n` +
        `🔹 **Shape:** ${diamond.shape}\n` +
        `⚖️ **Weight:** ${diamond.carat}ct\n` +
        `🎨 **Color:** ${diamond.color}\n` +
        `💎 **Clarity:** ${diamond.clarity}\n` +
        `✂️ **Cut:** ${diamond.cut}\n` +
        `💰 **Price:** $${diamond.price?.toLocaleString() || 'Contact for Price'}\n` +
        `📋 **Stock:** ${diamond.stockNumber}\n\n` +
        `${recipientName ? `Hi ${recipientName}! ` : ''}Check out this beautiful diamond I found for you! 💎✨`;

      // Create inline keyboard with professional buttons
      const inlineKeyboard = [
        [
          {
            text: '💎 View Diamond Details',
            web_app: { url: diamondUrl }
          },
          {
            text: '📞 Contact Seller',
            callback_data: `contact_${diamond.stockNumber}_${user.id}`
          }
        ],
        [
          {
            text: '🔗 Share with Others',
            switch_inline_query: `Check out this ${diamond.carat}ct ${diamond.shape} diamond! ${diamondUrl}`
          }
        ]
      ];

      // Send via Telegram's inline keyboard API
      if (webApp.switchInlineQuery) {
        // Use switchInlineQuery for sharing with inline keyboard
        webApp.switchInlineQuery(diamondMessage, false);
        
        // Send additional data to bot for inline keyboard processing
        const shareData = {
          action: 'share_diamond_inline',
          data: {
            diamond: {
              id: diamond.id,
              stockNumber: diamond.stockNumber,
              carat: diamond.carat,
              shape: diamond.shape,
              color: diamond.color,
              clarity: diamond.clarity,
              cut: diamond.cut,
              price: diamond.price,
              imageUrl: diamond.imageUrl
            },
            message: diamondMessage,
            inline_keyboard: inlineKeyboard,
            sharedBy: {
              id: user.id,
              name: user.first_name,
              username: user.username
            },
            diamondUrl: diamondUrl
          },
          timestamp: Date.now()
        };

        if (webApp.sendData) {
          webApp.sendData(JSON.stringify(shareData));
        }

        toast.success('💎 Diamond shared with inline buttons!');
        return true;
      } else {
        throw new Error('Inline sharing not available');
      }
    } catch (error) {
      console.error('❌ Failed to share diamond with inline keyboard:', error);
      toast.error('Failed to share diamond. Please try again.');
      return false;
    }
  }, [webApp, user]);

  const createSecureDiamondLink = useCallback((diamond: Diamond) => {
    if (!user) return null;
    
    return `${window.location.origin}/diamond/${diamond.id}?shared=true&from=${user.id}&secure=true`;
  }, [user]);

  return {
    shareDiamondWithInlineKeyboard,
    createSecureDiamondLink,
    isAvailable: !!(webApp && user)
  };
}
