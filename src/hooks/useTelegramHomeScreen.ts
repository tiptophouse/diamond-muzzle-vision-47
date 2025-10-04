import { useCallback, useEffect, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface HomeScreenState {
  isSupported: boolean;
  hasBeenPrompted: boolean;
  isAdded: boolean;
}

/**
 * SDK 2.0 Home Screen API Hook
 * Allows adding the Mini App to device home screen
 * Trigger after: User saves 5+ diamonds, completes first upload, positive engagement
 */
export function useTelegramHomeScreen() {
  const { webApp } = useTelegramWebApp();
  const [state, setState] = useState<HomeScreenState>({
    isSupported: false,
    hasBeenPrompted: false,
    isAdded: false
  });

  useEffect(() => {
    if (!webApp) return;

    // Check SDK 2.0 home screen support
    const isSupported = typeof webApp.addToHomeScreen === 'function';

    // Check if already prompted (stored in localStorage)
    const hasBeenPrompted = localStorage.getItem('homescreen_prompted') === 'true';

    setState(prev => ({
      ...prev,
      isSupported,
      hasBeenPrompted
    }));
  }, [webApp]);

  const promptAddToHomeScreen = useCallback((onSuccess?: () => void, onCancel?: () => void) => {
    if (!webApp || !state.isSupported || !webApp.addToHomeScreen) return;

    try {
      webApp.addToHomeScreen();
      
      // Mark as prompted
      localStorage.setItem('homescreen_prompted', 'true');
      setState(prev => ({ ...prev, hasBeenPrompted: true, isAdded: true }));
      
      onSuccess?.();
    } catch (error) {
      console.warn('Add to home screen failed:', error);
      onCancel?.();
    }
  }, [webApp, state.isSupported]);

  const checkShouldPrompt = useCallback((conditions: {
    savedDiamonds?: number;
    uploadsCompleted?: number;
    daysActive?: number;
  }) => {
    if (state.hasBeenPrompted || !state.isSupported) return false;

    // Smart prompting logic
    const hasMinimumEngagement = 
      (conditions.savedDiamonds && conditions.savedDiamonds >= 5) ||
      (conditions.uploadsCompleted && conditions.uploadsCompleted >= 1) ||
      (conditions.daysActive && conditions.daysActive >= 3);

    return hasMinimumEngagement;
  }, [state.hasBeenPrompted, state.isSupported]);

  return {
    isSupported: state.isSupported,
    hasBeenPrompted: state.hasBeenPrompted,
    isAdded: state.isAdded,
    promptAddToHomeScreen,
    checkShouldPrompt
  };
}
