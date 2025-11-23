import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

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
  const { webApp } = useTelegramWebApp();

  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    try {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred(style);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [webApp]);

  const notificationOccurred = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    try {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred(type);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [webApp]);

  const selectionChanged = useCallback(() => {
    try {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.selectionChanged();
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [webApp]);

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged,
  };
}