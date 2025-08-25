
import { useEffect, useState } from 'react';

interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  initData: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  viewportHeight: number;
  viewportStableHeight: number;
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    header_bg_color?: string;
    accent_text_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
  };
  MainButton: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type?: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  sendData?: (data: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      tg.ready();
    }
  }, []);

  const impactOccurred = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    webApp?.HapticFeedback?.impactOccurred(style);
  };

  const notificationOccurred = (type: 'error' | 'success' | 'warning' = 'success') => {
    webApp?.HapticFeedback?.notificationOccurred(type);
  };

  const selectionChanged = () => {
    webApp?.HapticFeedback?.selectionChanged();
  };

  // Main Button helpers
  const mainButton = {
    show: (text?: string, callback?: () => void, color?: string) => {
      if (webApp?.MainButton) {
        if (text) webApp.MainButton.setText(text);
        if (callback) webApp.MainButton.onClick(callback);
        webApp.MainButton.show();
      }
    },
    hide: () => {
      webApp?.MainButton?.hide();
    },
    setText: (text: string) => {
      webApp?.MainButton?.setText(text);
    },
    onClick: (callback: () => void) => {
      webApp?.MainButton?.onClick(callback);
    }
  };

  // Back Button helpers
  const backButton = {
    show: (callback?: () => void) => {
      if (webApp?.BackButton) {
        if (callback) webApp.BackButton.onClick(callback);
        webApp.BackButton.show();
      }
    },
    hide: () => {
      webApp?.BackButton?.hide();
    },
    onClick: (callback: () => void) => {
      webApp?.BackButton?.onClick(callback);
    }
  };

  // Haptic Feedback helpers
  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      webApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning' = 'success') => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback?.selectionChanged();
    }
  };

  return {
    webApp,
    user,
    isReady: !!webApp,
    impactOccurred,
    notificationOccurred,
    selectionChanged,
    close: () => webApp?.close(),
    expand: () => webApp?.expand(),
    mainButton,
    backButton,
    hapticFeedback,
  };
}
