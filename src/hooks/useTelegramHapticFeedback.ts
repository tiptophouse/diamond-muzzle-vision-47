import { useCallback } from 'react';

// Global throttle to prevent excessive haptic feedback across the app
let lastHapticTime = 0;
const MIN_HAPTIC_INTERVAL = 150; // ms

function canTriggerHaptic() {
  const now = Date.now();
  if (now - lastHapticTime < MIN_HAPTIC_INTERVAL) return false;
  lastHapticTime = now;
  return true;
}

export function useTelegramHapticFeedback() {
  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (!canTriggerHaptic()) return;
    try {
      (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
    } catch {}
  }, []);

  const notificationOccurred = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    if (!canTriggerHaptic()) return;
    try {
      (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
    } catch {}
  }, []);

  const selectionChanged = useCallback(() => {
    if (!canTriggerHaptic()) return;
    try {
      (window as any).Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    } catch {}
  }, []);

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged,
  };
}