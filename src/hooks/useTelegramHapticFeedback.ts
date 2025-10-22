import { useCallback } from 'react';

export function useTelegramHapticFeedback() {
  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    // Haptic feedback disabled
    return;
  }, []);

  const notificationOccurred = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    // Haptic feedback disabled
    return;
  }, []);

  const selectionChanged = useCallback(() => {
    // Haptic feedback disabled
    return;
  }, []);

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged,
  };
}