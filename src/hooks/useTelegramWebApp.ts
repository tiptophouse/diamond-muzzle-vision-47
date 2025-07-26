
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
      phone_number?: string;
    };
    query_id?: string;
    auth_date?: number;
    start_param?: string;
  };
  ready: () => void;
  close: () => void;
  expand: () => void;
  sendData?: (data: string) => void;
  openTelegramLink?: (url: string) => void;
  onEvent?: (eventType: string, callback: () => void) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  Accelerometer?: {
    start: (config?: { refresh_rate?: number }) => void;
    stop: () => void;
    isStarted: boolean;
  };
  DeviceOrientation?: {
    start: (config?: { refresh_rate?: number }) => void;
    stop: () => void;
    isStarted: boolean;
  };
  lockOrientation?: (orientation: 'portrait' | 'landscape') => void;
  unlockOrientation?: () => void;
}

export function useTelegramWebApp() {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user);
      tg.ready();
      tg.expand();
      setIsReady(true);
    } else {
      // Mock for development
      const mockWebApp: TelegramWebApp = {
        initData: '',
        initDataUnsafe: {
          user: {
            id: 12345,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'en',
          },
        },
        ready: () => {},
        close: () => {},
        expand: () => {},
        sendData: () => {},
        openTelegramLink: () => {},
        onEvent: () => {},
        MainButton: {
          text: '',
          color: '#007AFF',
          textColor: '#FFFFFF',
          isVisible: false,
          isActive: true,
          show: () => {},
          hide: () => {},
          enable: () => {},
          disable: () => {},
          setText: () => {},
          onClick: () => {},
          offClick: () => {},
        },
        BackButton: {
          isVisible: false,
          show: () => {},
          hide: () => {},
          onClick: () => {},
          offClick: () => {},
        },
        HapticFeedback: {
          impactOccurred: () => {},
          notificationOccurred: () => {},
          selectionChanged: () => {},
        },
        version: '6.0',
        platform: 'web',
        colorScheme: 'light' as const,
        themeParams: {
          bg_color: '#ffffff',
          text_color: '#000000',
          hint_color: '#999999',
          link_color: '#007AFF',
          button_color: '#007AFF',
          button_text_color: '#ffffff'
        },
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
      };
      setWebApp(mockWebApp);
      setUser(mockWebApp.initDataUnsafe.user);
      setIsReady(true);
    }
  }, []);

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      webApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback?.selectionChanged();
    },
  };

  const mainButton = {
    show: (text?: string, callback?: () => void, color?: string) => {
      if (text) webApp?.MainButton?.setText(text);
      if (callback) webApp?.MainButton?.onClick(callback);
      if (color) webApp!.MainButton!.color = color;
      webApp?.MainButton?.show();
    },
    hide: () => webApp?.MainButton?.hide(),
    enable: () => webApp?.MainButton?.enable(),
    disable: () => webApp?.MainButton?.disable(),
    setText: (text: string) => webApp?.MainButton?.setText(text),
    onClick: (callback: () => void) => webApp?.MainButton?.onClick(callback),
    offClick: (callback: () => void) => webApp?.MainButton?.offClick(callback),
    isVisible: webApp?.MainButton?.isVisible || false,
    isActive: webApp?.MainButton?.isActive || false,
  };

  const backButton = {
    show: (callback?: () => void) => {
      if (callback) webApp?.BackButton?.onClick(callback);
      webApp?.BackButton?.show();
    },
    hide: () => webApp?.BackButton?.hide(),
    onClick: (callback: () => void) => webApp?.BackButton?.onClick(callback),
    offClick: (callback: () => void) => webApp?.BackButton?.offClick(callback),
    isVisible: webApp?.BackButton?.isVisible || false,
  };

  return {
    webApp,
    user,
    isReady,
    hapticFeedback,
    mainButton,
    backButton,
    platform: webApp?.platform || 'web',
    version: webApp?.version || '6.0',
    colorScheme: webApp?.colorScheme || 'light',
    themeParams: webApp?.themeParams || {},
    isExpanded: webApp?.isExpanded || false,
    viewportHeight: webApp?.viewportHeight || window.innerHeight,
    viewportStableHeight: webApp?.viewportStableHeight || window.innerHeight,
    language: user?.language_code || 'en',
  };
}
