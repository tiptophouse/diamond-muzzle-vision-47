import { useEffect, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface SDK2Features {
  version: string;
  platform: string;
  hasFullscreen: boolean;
  hasHomeScreen: boolean;
  hasSettingsButton: boolean;
  hasCloudStorage: boolean;
  hasBiometric: boolean;
  hasAccelerometer: boolean;
  hasDeviceOrientation: boolean;
  hasGyroscope: boolean;
  hasLocationManager: boolean;
  hasShareStory: boolean;
  hasEmojiStatus: boolean;
  hasFileDownload: boolean;
}

/**
 * SDK 2.0 Feature Detection Hook
 * Detects available SDK 2.0 features and version
 * Use for progressive enhancement and graceful degradation
 */
export function useTelegramSDK2() {
  const { webApp, isReady } = useTelegramWebApp();
  const [features, setFeatures] = useState<SDK2Features>({
    version: '0.0',
    platform: 'unknown',
    hasFullscreen: false,
    hasHomeScreen: false,
    hasSettingsButton: false,
    hasCloudStorage: false,
    hasBiometric: false,
    hasAccelerometer: false,
    hasDeviceOrientation: false,
    hasGyroscope: false,
    hasLocationManager: false,
    hasShareStory: false,
    hasEmojiStatus: false,
    hasFileDownload: false
  });

  useEffect(() => {
    if (!isReady || !webApp) return;

    const detectedFeatures: SDK2Features = {
      version: webApp.version || '0.0',
      platform: webApp.platform || 'unknown',
      hasFullscreen: typeof webApp.requestFullscreen === 'function',
      hasHomeScreen: typeof webApp.addToHomeScreen === 'function',
      hasSettingsButton: !!(webApp.SettingsButton),
      hasCloudStorage: !!(webApp.CloudStorage),
      hasBiometric: !!(webApp.BiometricManager),
      hasAccelerometer: !!(webApp.Accelerometer),
      hasDeviceOrientation: !!(webApp.DeviceOrientation),
      hasGyroscope: !!(webApp.Gyroscope),
      hasLocationManager: !!(webApp.LocationManager),
      hasShareStory: typeof webApp.shareToStory === 'function',
      hasEmojiStatus: typeof webApp.setEmojiStatus === 'function',
      hasFileDownload: typeof webApp.downloadFile === 'function'
    };

    setFeatures(detectedFeatures);

    console.log('🚀 Telegram SDK 2.0 Features Detected:', detectedFeatures);
  }, [webApp, isReady]);

  const isSDK2Compatible = () => {
    // SDK 2.0 corresponds to version 8.0+
    const [major] = features.version.split('.').map(Number);
    return major >= 8;
  };

  const getFeatureAvailability = () => {
    return {
      fullscreen: features.hasFullscreen,
      homeScreen: features.hasHomeScreen,
      settings: features.hasSettingsButton,
      cloudStorage: features.hasCloudStorage,
      biometric: features.hasBiometric,
      sensors: features.hasAccelerometer || features.hasGyroscope,
      location: features.hasLocationManager,
      sharing: features.hasShareStory,
      customization: features.hasEmojiStatus
    };
  };

  return {
    features,
    isSDK2Compatible: isSDK2Compatible(),
    availability: getFeatureAvailability(),
    platform: features.platform,
    version: features.version
  };
}
