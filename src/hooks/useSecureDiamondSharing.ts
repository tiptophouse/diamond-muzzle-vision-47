
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
    // Create secure data payload that only works in Telegram for registered users
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
      miniAppUrl: window.location.origin,
      requiresRegistration: true
    };
  }, [user]);

  const verifyUserRegistration = useCallback(async (telegramId: number): Promise<boolean> => {
    try {
      // Check if user exists in user_profiles (meaning they've registered and clicked start)
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, status, created_at')
        .eq('telegram_id', telegramId)
        .single();

      if (error || !userProfile) {
        console.log('❌ User not found in database - not registered:', telegramId);
        return false;
      }

      // Additional check: user must be active and have been created (registered)
      if (userProfile.status !== 'active') {
        console.log('❌ User account is not active:', telegramId);
        return false;
      }

      console.log('✅ User is registered and active:', telegramId);
      return true;
    } catch (error) {
      console.error('❌ Error verifying user registration:', error);
      return false;
    }
  }, []);

  const trackShareClick = useCallback(async (diamondId: string, sharedBy: number) => {
    try {
      await supabase.from('diamond_share_analytics').insert({
        diamond_stock_number: diamondId,
        owner_telegram_id: sharedBy,
        viewer_telegram_id: user?.id,
        viewer_user_agent: navigator.userAgent,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        session_id: crypto.randomUUID(),
        shared_click: true,
        access_via_share: true
      });
      
      console.log('✅ Share click tracked for diamond:', diamondId);
    } catch (error) {
      console.error('❌ Failed to track share click:', error);
    }
  }, [user]);

  const shareWithInlineButtons = useCallback(async (diamond: Diamond) => {
    console.log('🔍 SHARE DEBUG: Starting share process for diamond:', diamond.stockNumber);
    console.log('📱 WebApp available:', !!webApp);
    console.log('👤 User available:', !!user);
    
    if (!webApp || !user) {
      console.error('❌ SHARE DEBUG: Missing requirements - webApp:', !!webApp, 'user:', !!user);
      toast.error('🔒 Telegram Mini App required for sharing');
      return false;
    }

    try {
      const shareData = createSecureShareData(diamond);
      console.log('📋 SHARE DEBUG: Created share data:', shareData);
      
      // Create the share message with inline buttons for registered users only
      const shareMessage = {
        action: 'share_diamond_with_registration_check',
        data: {
          diamond: shareData.diamond,
          message: `💎 *${diamond.carat} ct ${diamond.shape} Diamond*\n\n` +
                  `🎨 Color: ${diamond.color}\n` +
                  `💎 Clarity: ${diamond.clarity}\n` +
                  `✂️ Cut: ${diamond.cut}\n` +
                  `💰 Price: $${diamond.price?.toLocaleString() || 'Contact for Price'}\n\n` +
                  `Stock: ${diamond.stockNumber}\n\n` +
                  `⚠️ *Registration Required*: You must be registered in our Telegram Mini App to view this diamond.`,
          inline_keyboard: [
            [
              {
                text: '💎 View Diamond (Registered Users Only)',
                web_app: {
                  url: `${window.location.origin}/diamond/${diamond.id}?shared=true&from=${user.id}&verify=true`
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

      console.log('📤 SHARE DEBUG: Prepared share message:', shareMessage);

      // Send via Telegram WebApp
      const success = sendData(shareMessage);
      console.log('📤 SHARE DEBUG: Send result:', success);
      
      if (success) {
        // Track the share action
        await supabase.from('diamond_share_analytics').insert({
          diamond_stock_number: diamond.stockNumber,
          owner_telegram_id: user.id,
          viewer_telegram_id: null, // Will be filled when someone clicks
          action_type: 'share_initiated',
          session_id: crypto.randomUUID(),
          access_via_share: true
        });

        toast.success('💎 Diamond shared with registration verification!');
        return true;
      } else {
        throw new Error('Failed to send share data via Telegram WebApp');
      }
    } catch (error) {
      console.error('❌ SHARE DEBUG: Failed to share diamond:', error);
      toast.error('Failed to share diamond. Please try again.');
      return false;
    }
  }, [webApp, user, createSecureShareData, sendData]);

  return {
    shareWithInlineButtons,
    trackShareClick,
    verifyUserRegistration,
    isAvailable: !!(webApp && user)
  };
}
