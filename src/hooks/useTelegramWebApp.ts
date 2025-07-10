import { useEffect, useCallback } from 'react';
import { 
  initializeTelegramWebApp, 
  getTelegramWebApp, 
  setViewportHeight,
  useTelegramMainButton,
  isTelegramWebAppEnvironment 
} from '@/utils/telegramWebApp';

export interface TelegramWebAppHook {
  isInitialized: boolean;
  isTelegramEnv: boolean;
  setMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  enableHapticFeedback: () => void;
}

export function useTelegramWebApp(): TelegramWebAppHook {
  const mainButton = useTelegramMainButton();
  const isTelegramEnv = isTelegramWebAppEnvironment();

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log('🚀 Initializing Telegram WebApp...');
        
        // Initialize Telegram WebApp
        const success = await initializeTelegramWebApp();
        
        if (mounted) {
          console.log(`📱 Telegram WebApp initialized: ${success}`);
        }

        // Handle window resize for non-Telegram environments
        const handleResize = () => {
          if (mounted) {
            setViewportHeight(window.innerHeight);
          }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('orientationchange', handleResize);
        };
      } catch (error) {
        console.error('❌ Failed to initialize Telegram WebApp:', error);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const setMainButton = useCallback((text: string, onClick: () => void) => {
    try {
      mainButton.setText(text);
      mainButton.onClick(onClick);
      mainButton.enable();
      mainButton.show();
      console.log(`🔘 Main button set: "${text}"`);
    } catch (error) {
      console.error('❌ Failed to set main button:', error);
    }
  }, [mainButton]);

  const hideMainButton = useCallback(() => {
    try {
      mainButton.hide();
      console.log('🫥 Main button hidden');
    } catch (error) {
      console.error('❌ Failed to hide main button:', error);
    }
  }, [mainButton]);

  const enableHapticFeedback = useCallback(() => {
    try {
      const tg = getTelegramWebApp();
      if (tg && (tg as any).HapticFeedback) {
        (tg as any).HapticFeedback.impactOccurred('medium');
      }
    } catch (error) {
      console.error('❌ Failed to trigger haptic feedback:', error);
    }
  }, []);

  return {
    isInitialized: true,
    isTelegramEnv,
    setMainButton,
    hideMainButton,
    enableHapticFeedback
  };
}