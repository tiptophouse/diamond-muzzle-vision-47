import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramSDK2 } from '@/hooks/useTelegramSDK2';
import { useTelegramFullscreen } from '@/hooks/useTelegramFullscreen';
import { useTelegramHomeScreen } from '@/hooks/useTelegramHomeScreen';
import { useTelegramSettingsButton } from '@/hooks/useTelegramSettingsButton';
import { useTelegramCloudStorage } from '@/hooks/useTelegramCloudStorage';
import { useNavigate } from 'react-router-dom';

interface TelegramSDK2ContextType {
  // Core SDK
  webApp: any;
  isReady: boolean;
  
  // SDK 2.0 Feature Detection
  features: ReturnType<typeof useTelegramSDK2>['features'];
  isSDK2Compatible: boolean;
  
  // SDK 2.0 Features
  fullscreen: ReturnType<typeof useTelegramFullscreen>;
  homeScreen: ReturnType<typeof useTelegramHomeScreen>;
  settingsButton: ReturnType<typeof useTelegramSettingsButton>;
  cloudStorage: ReturnType<typeof useTelegramCloudStorage>;
}

const TelegramSDK2Context = createContext<TelegramSDK2ContextType | undefined>(undefined);

/**
 * SDK 2.0 Unified Provider
 * Single source of truth for all Telegram SDK functionality
 * Replaces scattered window.Telegram.WebApp calls throughout the app
 */
export function TelegramSDK2Provider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { webApp, isReady } = useTelegramWebApp();
  const { features, isSDK2Compatible } = useTelegramSDK2();
  
  // SDK 2.0 Features
  const fullscreen = useTelegramFullscreen();
  const homeScreen = useTelegramHomeScreen();
  const settingsButton = useTelegramSettingsButton(() => {
    navigate('/settings');
  });
  const cloudStorage = useTelegramCloudStorage();

  // Auto-show settings button on app load
  useEffect(() => {
    if (isReady && settingsButton.isSupported) {
      settingsButton.show();
    }
  }, [isReady, settingsButton]);

  // Log SDK compatibility
  useEffect(() => {
    if (isReady) {
      console.log('📱 Telegram SDK Status:', {
        version: features.version,
        platform: features.platform,
        isSDK2Compatible,
        features: {
          fullscreen: fullscreen.isSupported,
          homeScreen: homeScreen.isSupported,
          settingsButton: settingsButton.isSupported,
          cloudStorage: cloudStorage.isSupported
        }
      });
    }
  }, [isReady, features, isSDK2Compatible, fullscreen, homeScreen, settingsButton, cloudStorage]);

  const value: TelegramSDK2ContextType = {
    webApp,
    isReady,
    features,
    isSDK2Compatible,
    fullscreen,
    homeScreen,
    settingsButton,
    cloudStorage
  };

  return (
    <TelegramSDK2Context.Provider value={value}>
      {children}
    </TelegramSDK2Context.Provider>
  );
}

export function useTelegramSDK2Context() {
  const context = useContext(TelegramSDK2Context);
  if (context === undefined) {
    throw new Error('useTelegramSDK2Context must be used within a TelegramSDK2Provider');
  }
  return context;
}
