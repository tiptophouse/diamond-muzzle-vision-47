
import { useState, useEffect } from 'react';
import { initializeTelegramSDK, getTelegramWebApp } from '@/lib/telegramSDK';

export interface UseTelegramSDKReturn {
  isInitialized: boolean;
  webApp: any;
  user: any;
  initData: any;
  viewport: any;
  mainButton: any;
  hapticFeedback: any;
  error: string | null;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
  expand: () => void;
}

export function useModernTelegramSDK(): UseTelegramSDKReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [initData, setInitData] = useState<any>(null);
  const [viewport, setViewport] = useState<any>(null);
  const [mainButton, setMainButton] = useState<any>(null);
  const [hapticFeedback, setHapticFeedback] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const telegramSDK = await initializeTelegramSDK();
        const telegramWebApp = getTelegramWebApp();

        if (telegramSDK && telegramWebApp) {
          setWebApp(telegramWebApp);
          setInitData(telegramSDK.initData);
          setViewport(telegramSDK.viewport);
          setMainButton(telegramSDK.mainButton);
          setHapticFeedback(telegramSDK.hapticFeedback);
          
          // Extract user data from initData
          if (telegramSDK.initData?.user) {
            setUser(telegramSDK.initData.user);
          } else if (telegramWebApp.initDataUnsafe?.user) {
            setUser(telegramWebApp.initDataUnsafe.user);
          }

          setIsInitialized(true);
          console.log('✅ Telegram SDK hooks initialized successfully');
        } else {
          setError('Failed to initialize Telegram SDK');
          console.warn('⚠️ Telegram SDK initialization failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('❌ Telegram SDK initialization error:', err);
      }
    };

    initialize();
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.show();
      webApp.MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(type);
    }
  };

  const expand = () => {
    if (webApp?.expand) {
      webApp.expand();
    }
  };

  return {
    isInitialized,
    webApp,
    user,
    initData,
    viewport,
    mainButton,
    hapticFeedback,
    error,
    showMainButton,
    hideMainButton,
    triggerHaptic,
    expand
  };
}
