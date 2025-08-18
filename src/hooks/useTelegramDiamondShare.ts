
import { useState, useCallback } from 'react';
import { Diamond } from '@/types/diamond';
import { useTelegramWebApp } from './useTelegramWebApp';

interface TelegramSendDataPayload {
  action: string;
  data: any;
  timestamp: number;
}

export function useTelegramDiamondShare() {
  const [isAvailable, setIsAvailable] = useState(false);
  const { webApp } = useTelegramWebApp();

  const shareWithInlineButtons = useCallback(async (diamond: Diamond): Promise<boolean> => {
    if (!webApp || !webApp.sendData) {
      console.warn('Telegram WebApp not available for sharing');
      return false;
    }

    try {
      const shareData: TelegramSendDataPayload = {
        action: 'share_diamond',
        data: {
          stockNumber: diamond.stock_number,
          shape: diamond.shape,
          carat: diamond.carat,
          color: diamond.color,
          clarity: diamond.clarity,
          price: diamond.price
        },
        timestamp: Date.now()
      };

      webApp.sendData(JSON.stringify(shareData));
      console.log('✅ Diamond shared via Telegram with inline buttons');
      return true;
    } catch (error) {
      console.error('❌ Failed to share diamond:', error);
      return false;
    }
  }, [webApp]);

  const shareDiamondWithInlineKeyboard = useCallback(async (diamond: Diamond): Promise<boolean> => {
    return shareWithInlineButtons(diamond);
  }, [shareWithInlineButtons]);

  const trackShareClick = useCallback(async (diamondId: string, sharedBy: number): Promise<void> => {
    try {
      console.log(`📊 Tracking share click for diamond ${diamondId} by user ${sharedBy}`);
      // Add tracking logic here if needed
    } catch (error) {
      console.error('❌ Failed to track share click:', error);
    }
  }, []);

  const verifyUserRegistration = useCallback(async (telegramId: number): Promise<boolean> => {
    try {
      console.log(`🔍 Verifying user registration for Telegram ID: ${telegramId}`);
      // Add verification logic here if needed
      return true;
    } catch (error) {
      console.error('❌ Failed to verify user registration:', error);
      return false;
    }
  }, []);

  return {
    shareWithInlineButtons,
    shareDiamondWithInlineKeyboard,
    trackShareClick,
    verifyUserRegistration,
    isAvailable: !!webApp
  };
}
