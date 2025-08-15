import { useState, useEffect, useCallback } from 'react';
import { telegramSDK } from '@/lib/telegramSDK';

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  is_premium: boolean;
  photo_url: string;
}

interface ThemeParams {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
}

interface Contact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

interface UseTelegramSDKReturn {
  isWebAppReady: boolean;
  userData: UserData | null;
  themeParams: ThemeParams;
  setMainButton: (text: string, color?: string, textColor?: string) => void;
  hideMainButton: () => void;
  onMainButtonClick: (callback: () => void) => void;
  showBackButton: () => void;
  hideBackButton: () => void;
  setCloudStorage: (key: string, value: string) => Promise<void>;
  getCloudStorage: (key: string) => Promise<string | null>;
	requestWriteAccess: () => Promise<boolean>;
  requestContact: () => Promise<Contact | null>;
  shareURL: (url: string, text?: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export function useModernTelegramSDK(): UseTelegramSDKReturn {
  const [isWebAppReady, setIsWebAppReady] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [themeParams, setThemeParams] = useState<ThemeParams>({
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#707579',
    link_color: '#3390ec',
    button_color: '#3390ec',
    button_text_color: '#ffffff'
  });

  useEffect(() => {
    const initialize = async () => {
      const isInitialized = await telegramSDK.initialize();
      if (isInitialized) {
        setIsWebAppReady(telegramSDK.isWebAppReady());
        setUserData(telegramSDK.getUserData());
        setThemeParams(telegramSDK.getThemeParams());
      }
    };

    initialize();
  }, []);

  const setMainButton = useCallback((text: string, color?: string, textColor?: string) => {
    telegramSDK.setMainButton(text, color, textColor);
  }, []);

  const hideMainButton = useCallback(() => {
    telegramSDK.hideMainButton();
  }, []);

  const onMainButtonClick = useCallback((callback: () => void) => {
    return telegramSDK.onMainButtonClick(callback);
  }, []);

  const showBackButton = useCallback(() => {
    telegramSDK.showBackButton();
  }, []);

  const hideBackButton = useCallback(() => {
    telegramSDK.hideBackButton();
  }, []);

  const setCloudStorage = useCallback(async (key: string, value: string) => {
    await telegramSDK.setCloudStorage(key, value);
  }, []);

  const getCloudStorage = useCallback(async (key: string) => {
    return await telegramSDK.getCloudStorage(key);
  }, []);

  const requestWriteAccess = useCallback(async () => {
    return await telegramSDK.requestWriteAccess();
  }, []);

  const requestContact = useCallback(async () => {
    try {
      const contact = await telegramSDK.requestContact();
      if (contact) {
        console.log('📞 Contact received:', contact);
        return contact;
      }
      return null;
    } catch (error) {
      console.error('❌ Error requesting contact:', error);
      return null;
    }
  }, []);

  const shareURL = useCallback((url: string, text?: string) => {
    telegramSDK.shareURL(url, text);
  }, []);

  const openLink = useCallback((url: string) => {
    telegramSDK.openLink(url);
  }, []);

  const openTelegramLink = useCallback((url: string) => {
    telegramSDK.openTelegramLink(url);
  }, []);

  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    telegramSDK.impactOccurred(style);
  }, []);

  const notificationOccurred = useCallback((type: 'error' | 'success' | 'warning') => {
    telegramSDK.notificationOccurred(type);
  }, []);

  const selectionChanged = useCallback(() => {
    telegramSDK.selectionChanged();
  }, []);

  return {
    isWebAppReady,
    userData,
    themeParams,
    setMainButton,
    hideMainButton,
    onMainButtonClick,
    showBackButton,
    hideBackButton,
    setCloudStorage,
    getCloudStorage,
		requestWriteAccess,
    requestContact,
    shareURL,
    openLink,
    openTelegramLink,
    impactOccurred,
    notificationOccurred,
    selectionChanged
  };
}
