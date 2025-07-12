import { useCallback } from 'react';

export function useTelegramHapticFeedback() {
  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  }, []);

  const notificationOccurred = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
  }, []);

  const selectionChanged = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  }, []);

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged,
  };
}