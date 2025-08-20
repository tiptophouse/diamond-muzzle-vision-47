
import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useTelegramSendData } from './useTelegramSendData';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useSecureStoreSharing() {
  const { webApp, user } = useTelegramWebApp();
  const { sendData } = useTelegramSendData();

  const trackShareAction = useCallback(async (type: 'store' | 'diamond', itemId?: string) => {
    if (!user) return;

    try {
      await supabase.from('diamond_share_analytics').insert({
        diamond_stock_number: itemId || 'store_share',
        owner_telegram_id: user.id,
        viewer_telegram_id: null,
        action_type: `${type}_share_initiated`,
        session_id: crypto.randomUUID(),
        access_via_share: true
      });
    } catch (error) {
      console.error('❌ Failed to track share action:', error);
    }
  }, [user]);

  const shareStore = useCallback(async () => {
    if (!webApp || !user) {
      toast.error('🔒 Telegram Mini App required for sharing');
      return false;
    }

    try {
      const shareMessage = {
        action: 'share_secure_store',
        data: {
          message: `💎 *Exclusive Diamond Collection*\n\n` +
                  `🏪 Browse my premium diamond store\n` +
                  `✨ Handpicked selection of certified diamonds\n` +
                  `🔒 Secure access - Registration required\n\n` +
                  `⚠️ *Authentication Required*: You must be registered in our Telegram Mini App to view this collection.`,
          inline_keyboard: [
            [
              {
                text: '💎 Browse Diamond Store (Registered Users)',
                web_app: {
                  url: `${window.location.origin}/catalog?shared=true&from=${user.id}&verify=true&locked=true`
                }
              }
            ],
            [
              {
                text: '📝 Register & Start Mini App',
                web_app: {
                  url: `${window.location.origin}/?register=true&from=${user.id}`
                }
              }
            ],
            [
              {
                text: '💬 Contact Store Owner',
                callback_data: `contact_store_owner_${user.id}`
              }
            ]
          ]
        },
        timestamp: Date.now(),
        requiresRegistration: true
      };

      const success = sendData(shareMessage);
      
      if (success) {
        await trackShareAction('store');
        toast.success('🏪 Store shared securely!');
        return true;
      } else {
        throw new Error('Failed to send share data');
      }
    } catch (error) {
      console.error('❌ Failed to share store:', error);
      toast.error('Failed to share store. Please try again.');
      return false;
    }
  }, [webApp, user, sendData, trackShareAction]);

  const shareDiamond = useCallback(async (diamond: Diamond) => {
    if (!webApp || !user) {
      toast.error('🔒 Telegram Mini App required for sharing');
      return false;
    }

    try {
      const shareMessage = {
        action: 'share_secure_diamond',
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
            imageUrl: diamond.imageUrl,
            gem360Url: diamond.gem360Url
          },
          message: `💎 *${diamond.carat} ct ${diamond.shape} Diamond*\n\n` +
                  `🎨 Color: ${diamond.color}\n` +
                  `💎 Clarity: ${diamond.clarity}\n` +
                  `✂️ Cut: ${diamond.cut}\n` +
                  `💰 Price: $${diamond.price?.toLocaleString() || 'Contact for Price'}\n\n` +
                  `Stock: ${diamond.stockNumber}\n\n` +
                  `🔒 *Secure Access - Registration Required*`,
          inline_keyboard: [
            [
              {
                text: '💎 View Diamond Details (Registered Users)',
                web_app: {
                  url: `${window.location.origin}/diamond/${diamond.id}?shared=true&from=${user.id}&verify=true&locked=true`
                }
              }
            ],
            [
              {
                text: '🏪 Browse Full Store',
                web_app: {
                  url: `${window.location.origin}/catalog?shared=true&from=${user.id}&verify=true&locked=true`
                }
              }
            ],
            [
              {
                text: '📝 Register & Start Mini App',
                web_app: {
                  url: `${window.location.origin}/?register=true&from=${user.id}`
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
        timestamp: Date.now(),
        requiresRegistration: true
      };

      const success = sendData(shareMessage);
      
      if (success) {
        await trackShareAction('diamond', diamond.stockNumber);
        toast.success('💎 Diamond shared securely!');
        return true;
      } else {
        throw new Error('Failed to send share data');
      }
    } catch (error) {
      console.error('❌ Failed to share diamond:', error);
      toast.error('Failed to share diamond. Please try again.');
      return false;
    }
  }, [webApp, user, sendData, trackShareAction]);

  return {
    shareStore,
    shareDiamond,
    isAvailable: !!(webApp && user)
  };
}
