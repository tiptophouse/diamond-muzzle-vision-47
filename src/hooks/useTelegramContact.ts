
import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useTelegramSendData } from './useTelegramSendData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { supabase } from '@/integrations/supabase/client';

export function useTelegramContact() {
  const { webApp } = useTelegramWebApp();
  const { sendData } = useTelegramSendData();
  const { user } = useTelegramAuth();

  const sendContactMessage = useCallback(async (diamond: Diamond, ownerTelegramId: number) => {
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    try {
      // First, try to send via Telegram Bot API through Supabase function
      const { error } = await supabase.functions.invoke('send-diamond-contact', {
        body: {
          diamondData: {
            stockNumber: diamond.stockNumber,
            shape: diamond.shape,
            carat: diamond.carat,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: diamond.price,
            lab: diamond.lab,
            certificateNumber: diamond.certificateNumber,
            imageUrl: diamond.imageUrl || diamond.picture,
            certificateUrl: diamond.certificateUrl
          },
          visitorInfo: {
            telegramId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username
          },
          ownerTelegramId
        }
      });

      if (error) {
        console.error('Error sending contact message:', error);
        return false;
      }

      // Also send data to the bot if available
      if (webApp && sendData) {
        sendData({
          action: 'diamond_contact',
          data: {
            diamond: {
              stockNumber: diamond.stockNumber,
              shape: diamond.shape,
              carat: diamond.carat,
              color: diamond.color,
              clarity: diamond.clarity,
              cut: diamond.cut,
              price: diamond.price
            },
            visitor: {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username
            },
            ownerTelegramId
          },
          timestamp: Date.now()
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to send contact message:', error);
      return false;
    }
  }, [user, webApp, sendData]);

  const openTelegramChat = useCallback((username?: string, telegramId?: number, message?: string) => {
    if (!webApp) {
      console.error('Telegram WebApp not available');
      return false;
    }

    try {
      let chatUrl = '';
      
      if (username) {
        chatUrl = `https://t.me/${username}`;
      } else if (telegramId) {
        chatUrl = `tg://user?id=${telegramId}`;
      } else {
        console.error('No username or telegram ID provided');
        return false;
      }

      if (message) {
        chatUrl += `?text=${encodeURIComponent(message)}`;
      }

      // Use Telegram WebApp's openTelegramLink method
      if (webApp.openTelegramLink) {
        webApp.openTelegramLink(chatUrl);
        return true;
      } else if (webApp.openLink) {
        webApp.openLink(chatUrl);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to open Telegram chat:', error);
      return false;
    }
  }, [webApp]);

  return {
    sendContactMessage,
    openTelegramChat,
    isAvailable: !!webApp
  };
}
