import { useState, useCallback, useEffect } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

/**
 * Telegram Biometric Authentication Hook
 * Provides face/fingerprint authentication for sensitive operations
 * 
 * Best Practices:
 * - Always check isBiometricAvailable before requesting access
 * - Provide clear reason text for access request
 * - Store biometric token securely (encrypted by Telegram)
 * - Use for payment confirmations, sensitive data access
 * - Fallback to password if biometric unavailable
 */

interface UseBiometricReturn {
  isAvailable: boolean;
  isInitialized: boolean;
  biometricType: 'finger' | 'face' | 'unknown';
  isAccessGranted: boolean;
  deviceId: string;
  requestAccess: (reason?: string) => Promise<boolean>;
  authenticate: (reason?: string) => Promise<{ success: boolean; token?: string }>;
  saveBiometricToken: (token: string) => Promise<boolean>;
  openSettings: () => void;
  initialize: () => Promise<boolean>;
}

export function useTelegramBiometric(): UseBiometricReturn {
  const { webApp } = useTelegramWebApp();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'finger' | 'face' | 'unknown'>('unknown');
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  const initialize = useCallback(async (): Promise<boolean> => {
    if (!webApp?.BiometricManager) {
      console.warn('BiometricManager not available');
      return false;
    }

    return new Promise((resolve) => {
      webApp.BiometricManager.init(() => {
        setIsInitialized(webApp.BiometricManager.isInited);
        setIsAvailable(webApp.BiometricManager.isBiometricAvailable);
        setBiometricType(webApp.BiometricManager.biometricType);
        setIsAccessGranted(webApp.BiometricManager.isAccessGranted);
        setDeviceId(webApp.BiometricManager.deviceId);

        console.log('🔐 BiometricManager initialized:', {
          available: webApp.BiometricManager.isBiometricAvailable,
          type: webApp.BiometricManager.biometricType,
          accessGranted: webApp.BiometricManager.isAccessGranted,
          deviceId: webApp.BiometricManager.deviceId,
        });

        resolve(webApp.BiometricManager.isInited);
      });
    });
  }, [webApp]);

  useEffect(() => {
    if (webApp?.BiometricManager) {
      initialize();
    }
  }, [webApp, initialize]);

  const requestAccess = useCallback(
    async (reason = 'Authenticate to access this feature'): Promise<boolean> => {
      if (!webApp?.BiometricManager || !isAvailable) {
        console.warn('BiometricManager not available or biometrics unavailable');
        return false;
      }

      return new Promise((resolve) => {
        webApp.BiometricManager.requestAccess({ reason }, (granted) => {
          setIsAccessGranted(granted);
          console.log(`🔐 Biometric access ${granted ? 'granted' : 'denied'}`);
          resolve(granted);
        });
      });
    },
    [webApp, isAvailable]
  );

  const authenticate = useCallback(
    async (
      reason = 'Authenticate to proceed'
    ): Promise<{ success: boolean; token?: string }> => {
      if (!webApp?.BiometricManager || !isAccessGranted) {
        console.warn('BiometricManager not available or access not granted');
        return { success: false };
      }

      return new Promise((resolve) => {
        webApp.BiometricManager.authenticate({ reason }, (success, token) => {
          console.log(`🔐 Biometric authentication ${success ? 'successful' : 'failed'}`);
          resolve({ success, token });
        });
      });
    },
    [webApp, isAccessGranted]
  );

  const saveBiometricToken = useCallback(
    async (token: string): Promise<boolean> => {
      if (!webApp?.BiometricManager) {
        console.warn('BiometricManager not available');
        return false;
      }

      return new Promise((resolve) => {
        webApp.BiometricManager.updateBiometricToken(token, (success) => {
          console.log(`🔐 Biometric token ${success ? 'saved' : 'save failed'}`);
          resolve(success);
        });
      });
    },
    [webApp]
  );

  const openSettings = useCallback(() => {
    if (!webApp?.BiometricManager) {
      console.warn('BiometricManager not available');
      return;
    }
    webApp.BiometricManager.openSettings();
  }, [webApp]);

  return {
    isAvailable,
    isInitialized,
    biometricType,
    isAccessGranted,
    deviceId,
    requestAccess,
    authenticate,
    saveBiometricToken,
    openSettings,
    initialize,
  };
}
