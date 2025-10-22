import { useCallback } from 'react';

/**
 * Telegram Haptic Feedback Hook
 * Provides tactile feedback for better user experience
 * 
 * Best Practices:
 * - Use 'light' for subtle actions (selection, hover)
 * - Use 'medium' for standard actions (button press, toggle)
 * - Use 'heavy' for important actions (confirm, submit)
 * - Use 'rigid' for error states or invalid input
 * - Use 'soft' for gentle feedback
 * - Use notification types for operation results
 * - Always pair with visual feedback
 */

export function useTelegramHapticFeedback() {
  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    try {
      const tg = window.Telegram?.WebApp as any;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(style);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, []);

  const notificationOccurred = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    try {
      const tg = window.Telegram?.WebApp as any;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred(type);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, []);

  const selectionChanged = useCallback(() => {
    try {
      const tg = window.Telegram?.WebApp as any;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, []);

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged,
  };
}