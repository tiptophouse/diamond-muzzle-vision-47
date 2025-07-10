import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { TelegramUser, TelegramWebApp, ThemeParams } from '@/utils/telegramWebApp';

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isInTelegram: boolean;
  isLoading: boolean;
  themeParams: ThemeParams | null;
  colorScheme: 'light' | 'dark' | null;
  platform: string | null;
  isIOS: boolean;
  isAndroid: boolean;
  viewportHeight: number;
  isExpanded: boolean;
  
  // Actions
  showBackButton: (callback?: () => void) => void;
  hideBackButton: () => void;
  setMainButton: (config: {
    text: string;
    color?: string;
    textColor?: string;
    isActive?: boolean;
    isVisible?: boolean;
    onClick?: () => void;
  }) => void;
  hideMainButton: () => void;
  hapticFeedback: (type: 'impact' | 'notification' | 'selection', style?: string) => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  openLink: (url: string, tryInstantView?: boolean) => void;
  readClipboard: () => Promise<string | null>;
  close: () => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const telegramWebApp = useTelegramWebApp();
  
  return (
    <TelegramContext.Provider value={telegramWebApp}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}