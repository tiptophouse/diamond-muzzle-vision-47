import { useEffect, useCallback } from 'react';
import { 
  init, 
  viewport, 
  themeParams, 
  miniApp,
  backButton,
  mainButton,
  hapticFeedback,
  closingBehavior,
  swipeBehavior
} from '@telegram-apps/sdk';
import { logger } from '@/utils/logger';

/**
 * Professional Telegram Mini App SDK Initialization Hook
 * Follows 2025 best practices for @telegram-apps/sdk v3.11.8
 */
export function useTelegramSDKInit() {
  const initSDK = useCallback(async () => {
    try {
      // Initialize SDK
      init();
      logger.info('✅ Telegram SDK initialized');

      // Expand viewport to full screen
      if (viewport.mount.isAvailable()) {
        viewport.mount();
        viewport.expand();
        logger.info('✅ Viewport expanded');
      }

      // Apply theme CSS variables for instant theme sync
      if (themeParams.mount.isAvailable()) {
        themeParams.mount();
        themeParams.bindCssVars();
        logger.info('✅ Theme params applied', themeParams.state());
      }

      // Mount mini app instance
      if (miniApp.mount.isAvailable()) {
        miniApp.mount();
        miniApp.ready();
        logger.info('✅ Mini app ready');
      }

      // Disable vertical swipes (prevents accidental app closure)
      if (swipeBehavior.mount.isAvailable()) {
        swipeBehavior.mount();
        swipeBehavior.disableVertical();
        logger.info('✅ Vertical swipes disabled');
      }

      // Configure closing behavior
      if (closingBehavior.mount.isAvailable()) {
        closingBehavior.mount();
        closingBehavior.enableConfirmation();
        logger.info('✅ Closing confirmation enabled');
      }

      // Welcome haptic feedback
      if (hapticFeedback.impactOccurred.isAvailable()) {
        hapticFeedback.impactOccurred('light');
      }

      return true;
    } catch (error) {
      logger.error('❌ Failed to initialize Telegram SDK:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    initSDK();
  }, [initSDK]);

  // Return SDK utilities
  return {
    viewport,
    themeParams,
    miniApp,
    backButton,
    mainButton,
    hapticFeedback,
    isSDKReady: true
  };
}
