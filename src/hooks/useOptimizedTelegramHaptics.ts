// Optimized Telegram haptics using the new SDK
import { useCallback } from 'react';
import { telegramSDK } from '@/lib/telegram/telegramSDK';

export function useOptimizedTelegramHaptics() {
  const impact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    telegramSDK.haptic.impact(style);
  }, []);

  const notification = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    telegramSDK.haptic.notification(type);
  }, []);

  const selection = useCallback(() => {
    telegramSDK.haptic.selection();
  }, []);

  return {
    impact,
    notification,
    selection
  };
}