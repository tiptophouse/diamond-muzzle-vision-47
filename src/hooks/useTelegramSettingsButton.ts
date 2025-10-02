import { useCallback, useEffect, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface SettingsButtonState {
  isVisible: boolean;
  isSupported: boolean;
}

/**
 * SDK 2.0 Settings Button API Hook
 * Native settings button in Telegram UI (replaces custom navigation)
 * Auto-shows on app launch, can be hidden on specific pages
 */
export function useTelegramSettingsButton(onClick?: () => void) {
  const { webApp } = useTelegramWebApp();
  const [state, setState] = useState<SettingsButtonState>({
    isVisible: false,
    isSupported: false
  });

  useEffect(() => {
    if (!webApp) return;

    // Check SDK 2.0 settings button support
    const isSupported = !!(webApp.SettingsButton);

    setState(prev => ({ ...prev, isSupported }));

    if (isSupported && webApp.SettingsButton) {
      const settingsButton = webApp.SettingsButton;

      // Set up click handler
      if (onClick) {
        settingsButton.onClick(onClick);
      }

      return () => {
        if (settingsButton.offClick) {
          settingsButton.offClick();
        }
      };
    }
  }, [webApp, onClick]);

  const show = useCallback(() => {
    if (webApp?.SettingsButton && state.isSupported) {
      webApp.SettingsButton.show();
      setState(prev => ({ ...prev, isVisible: true }));
    }
  }, [webApp, state.isSupported]);

  const hide = useCallback(() => {
    if (webApp?.SettingsButton && state.isSupported) {
      webApp.SettingsButton.hide();
      setState(prev => ({ ...prev, isVisible: false }));
    }
  }, [webApp, state.isSupported]);

  return {
    isVisible: state.isVisible,
    isSupported: state.isSupported,
    show,
    hide
  };
}
