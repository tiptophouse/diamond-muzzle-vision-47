/**
 * Advanced Telegram SDK 2.0 Features
 * Leverages the latest Telegram Mini App capabilities
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

export function useTelegramAdvanced() {
  const webAppRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      webAppRef.current = window.Telegram.WebApp;
      webAppRef.current.ready();
      webAppRef.current.expand();
      setIsInitialized(true);

      // Enable advanced features
      if (webAppRef.current.enableClosingConfirmation) {
        webAppRef.current.enableClosingConfirmation();
      }

      // Disable vertical swipes for better UX
      if (webAppRef.current.disableVerticalSwipes) {
        webAppRef.current.disableVerticalSwipes();
      }

      // Setup closing behavior
      if (webAppRef.current.ClosingBehavior) {
        webAppRef.current.ClosingBehavior.enableConfirmation();
      }

      console.log('✨ Advanced Telegram SDK features enabled');
    }
  }, []);

  // Secondary Button (Telegram 7.0+)
  const secondaryButton = {
    show: useCallback((text: string, onClick: () => void, options?: {
      color?: string;
      textColor?: string;
      position?: 'left' | 'right' | 'top' | 'bottom';
      hasShineEffect?: boolean;
    }) => {
      const webApp = webAppRef.current;
      if (webApp?.SecondaryButton) {
        webApp.SecondaryButton.setText(text);
        if (options?.color) webApp.SecondaryButton.color = options.color;
        if (options?.textColor) webApp.SecondaryButton.textColor = options.textColor;
        if (options?.hasShineEffect) webApp.SecondaryButton.hasShineEffect = true;
        if (options?.position) webApp.SecondaryButton.position = options.position;
        webApp.SecondaryButton.onClick(onClick);
        webApp.SecondaryButton.show();
      }
    }, []),
    hide: useCallback(() => {
      if (webAppRef.current?.SecondaryButton) {
        webAppRef.current.SecondaryButton.hide();
      }
    }, []),
    showProgress: useCallback(() => {
      if (webAppRef.current?.SecondaryButton?.showProgress) {
        webAppRef.current.SecondaryButton.showProgress();
      }
    }, []),
    hideProgress: useCallback(() => {
      if (webAppRef.current?.SecondaryButton?.hideProgress) {
        webAppRef.current.SecondaryButton.hideProgress();
      }
    }, []),
  };

  // Bottom Bar (Telegram 7.1+)
  const bottomBar = {
    setColor: useCallback((color: string) => {
      if (webAppRef.current?.BottomBar?.setBackgroundColor) {
        webAppRef.current.BottomBar.setBackgroundColor(color);
      }
    }, []),
    show: useCallback(() => {
      if (webAppRef.current?.BottomBar?.show) {
        webAppRef.current.BottomBar.show();
      }
    }, []),
    hide: useCallback(() => {
      if (webAppRef.current?.BottomBar?.hide) {
        webAppRef.current.BottomBar.hide();
      }
    }, []),
  };

  // Accelerometer (Diamond 3D viewing)
  const accelerometer = {
    start: useCallback((callback: (data: { x: number; y: number; z: number }) => void, refreshRate = 60) => {
      if (webAppRef.current?.Accelerometer) {
        webAppRef.current.Accelerometer.start({ refresh_rate: refreshRate }, callback);
        return true;
      }
      return false;
    }, []),
    stop: useCallback(() => {
      if (webAppRef.current?.Accelerometer?.stop) {
        webAppRef.current.Accelerometer.stop();
      }
    }, []),
    isStarted: useCallback(() => {
      return webAppRef.current?.Accelerometer?.isStarted || false;
    }, []),
  };

  // Gyroscope (Diamond rotation)
  const gyroscope = {
    start: useCallback((callback: (data: { x: number; y: number; z: number }) => void, refreshRate = 60) => {
      if (webAppRef.current?.Gyroscope) {
        webAppRef.current.Gyroscope.start({ refresh_rate: refreshRate }, callback);
        return true;
      }
      return false;
    }, []),
    stop: useCallback(() => {
      if (webAppRef.current?.Gyroscope?.stop) {
        webAppRef.current.Gyroscope.stop();
      }
    }, []),
    isStarted: useCallback(() => {
      return webAppRef.current?.Gyroscope?.isStarted || false;
    }, []),
  };

  // Device Orientation (Diamond viewing optimization)
  const deviceOrientation = {
    start: useCallback((callback: (data: {
      absolute: boolean;
      alpha: number;
      beta: number;
      gamma: number;
    }) => void, needAbsolute = false, refreshRate = 60) => {
      if (webAppRef.current?.DeviceOrientation) {
        webAppRef.current.DeviceOrientation.start({ 
          need_absolute: needAbsolute,
          refresh_rate: refreshRate 
        }, callback);
        return true;
      }
      return false;
    }, []),
    stop: useCallback(() => {
      if (webAppRef.current?.DeviceOrientation?.stop) {
        webAppRef.current.DeviceOrientation.stop();
      }
    }, []),
    isStarted: useCallback(() => {
      return webAppRef.current?.DeviceOrientation?.isStarted || false;
    }, []),
  };

  // Story Sharing (Telegram 7.2+)
  const shareStory = useCallback(async (mediaUrl: string, options?: {
    text?: string;
    widgetLink?: { url: string; name?: string };
  }) => {
    console.log('📱 shareStory called:', {
      isInitialized,
      hasWebApp: !!webAppRef.current,
      hasShareMethod: !!webAppRef.current?.shareToStory,
      mediaUrl
    });

    if (!isInitialized) {
      console.warn('⚠️ Story sharing attempted before initialization');
      return false;
    }

    const webApp = webAppRef.current;
    if (!webApp) {
      console.error('❌ WebApp not available');
      return false;
    }

    if (!webApp.shareToStory) {
      console.error('❌ shareToStory method not available (requires Telegram 7.2+)');
      return false;
    }

    // Validate image URL
    if (!mediaUrl || !mediaUrl.startsWith('http')) {
      console.error('❌ Invalid media URL:', mediaUrl);
      return false;
    }

    try {
      console.log('🚀 Calling webApp.shareToStory...');
      await webApp.shareToStory(mediaUrl, {
        text: options?.text,
        widget_link: options?.widgetLink ? {
          url: options.widgetLink.url,
          name: options.widgetLink.name
        } : undefined
      });
      console.log('✅ Story share successful');
      return true;
    } catch (error) {
      console.error('❌ Share to story failed:', error);
      return false;
    }
  }, [isInitialized]);

  // Enhanced CloudStorage with batch operations
  const cloudStorage = {
    // Standard operations
    setItem: useCallback(async (key: string, value: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (webAppRef.current?.CloudStorage) {
          webAppRef.current.CloudStorage.setItem(key, value, (error: any, success: boolean) => {
            resolve(!error && success);
          });
        } else {
          // Fallback to localStorage
          try {
            localStorage.setItem(`tg_cloud_${key}`, value);
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    }, []),
    getItem: useCallback(async (key: string): Promise<string | null> => {
      return new Promise((resolve) => {
        if (webAppRef.current?.CloudStorage) {
          webAppRef.current.CloudStorage.getItem(key, (error: any, value: string | null) => {
            resolve(error ? null : value);
          });
        } else {
          // Fallback to localStorage
          resolve(localStorage.getItem(`tg_cloud_${key}`));
        }
      });
    }, []),
    removeItem: useCallback(async (key: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (webAppRef.current?.CloudStorage) {
          webAppRef.current.CloudStorage.removeItem(key, (error: any, success: boolean) => {
            resolve(!error && success);
          });
        } else {
          try {
            localStorage.removeItem(`tg_cloud_${key}`);
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    }, []),
    getKeys: useCallback(async (): Promise<string[]> => {
      return new Promise((resolve) => {
        if (webAppRef.current?.CloudStorage) {
          webAppRef.current.CloudStorage.getKeys((error: any, keys: string[]) => {
            resolve(error ? [] : keys);
          });
        } else {
          // Fallback to localStorage
          const keys = Object.keys(localStorage)
            .filter(k => k.startsWith('tg_cloud_'))
            .map(k => k.replace('tg_cloud_', ''));
          resolve(keys);
        }
      });
    }, []),
    // Batch operations for performance
    setItems: useCallback(async (items: Record<string, string>): Promise<boolean> => {
      const promises = Object.entries(items).map(([key, value]) => 
        new Promise<boolean>((resolve) => {
          if (webAppRef.current?.CloudStorage) {
            webAppRef.current.CloudStorage.setItem(key, value, (error: any, success: boolean) => {
              resolve(!error && success);
            });
          } else {
            try {
              localStorage.setItem(`tg_cloud_${key}`, value);
              resolve(true);
            } catch {
              resolve(false);
            }
          }
        })
      );
      const results = await Promise.all(promises);
      return results.every(r => r);
    }, []),
    getItems: useCallback(async (keys: string[]): Promise<Record<string, string | null>> => {
      const promises = keys.map(key => 
        new Promise<[string, string | null]>((resolve) => {
          if (webAppRef.current?.CloudStorage) {
            webAppRef.current.CloudStorage.getItem(key, (error: any, value: string | null) => {
              resolve([key, error ? null : value]);
            });
          } else {
            resolve([key, localStorage.getItem(`tg_cloud_${key}`)]);
          }
        })
      );
      const results = await Promise.all(promises);
      return Object.fromEntries(results);
    }, []),
    removeItems: useCallback(async (keys: string[]): Promise<boolean> => {
      const promises = keys.map(key =>
        new Promise<boolean>((resolve) => {
          if (webAppRef.current?.CloudStorage) {
            webAppRef.current.CloudStorage.removeItem(key, (error: any, success: boolean) => {
              resolve(!error && success);
            });
          } else {
            try {
              localStorage.removeItem(`tg_cloud_${key}`);
              resolve(true);
            } catch {
              resolve(false);
            }
          }
        })
      );
      const results = await Promise.all(promises);
      return results.every(r => r);
    }, []),
  };

  // Download Files (Telegram 7.3+)
  const downloadFile = useCallback(async (url: string, fileName: string) => {
    const webApp = webAppRef.current;
    if (webApp?.downloadFile) {
      try {
        const result = await webApp.downloadFile({ url, file_name: fileName });
        return result;
      } catch (error) {
        console.error('Download failed:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Check Feature Support - Use useMemo to recalculate when initialized
  const features = useMemo(() => {
    const webApp = webAppRef.current;
    const featureSet = {
      hasSecondaryButton: !!webApp?.SecondaryButton,
      hasBottomBar: !!webApp?.BottomBar,
      hasAccelerometer: !!webApp?.Accelerometer,
      hasGyroscope: !!webApp?.Gyroscope,
      hasDeviceOrientation: !!webApp?.DeviceOrientation,
      hasStorySharing: !!webApp?.shareToStory,
      hasFileDownload: !!webApp?.downloadFile,
      hasEmojiStatus: !!webApp?.setEmojiStatus,
      hasFullscreen: !!webApp?.requestFullscreen,
      hasHomeScreen: !!webApp?.addToHomeScreen,
      hasContactSharing: !!webApp?.requestContact,
      hasWriteAccess: !!webApp?.requestWriteAccess,
      hasPhoneAccess: !!webApp?.requestPhoneAccess,
    };
    
    console.log('🔍 Feature detection:', {
      isInitialized,
      hasStorySharing: featureSet.hasStorySharing,
      webAppVersion: webApp?.version,
      platform: webApp?.platform
    });
    
    return featureSet;
  }, [isInitialized]);

  // Emoji Status (Telegram 7.0+)
  const setEmojiStatus = useCallback(async (customEmojiId: string, duration?: number) => {
    const webApp = webAppRef.current;
    if (webApp?.setEmojiStatus) {
      try {
        await webApp.setEmojiStatus(customEmojiId, { duration });
        return true;
      } catch (error) {
        console.error('Set emoji status failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Request Phone Access (Telegram 7.2+)
  const requestPhoneAccess = useCallback(async () => {
    const webApp = webAppRef.current;
    if (webApp?.requestPhoneAccess) {
      try {
        const result = await webApp.requestPhoneAccess();
        return result.status === 'granted';
      } catch (error) {
        console.error('Phone access request failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Enhanced Closing Behavior
  const closingBehavior = {
    enableConfirmation: useCallback(() => {
      if (webAppRef.current?.ClosingBehavior?.enableConfirmation) {
        webAppRef.current.ClosingBehavior.enableConfirmation();
      }
    }, []),
    disableConfirmation: useCallback(() => {
      if (webAppRef.current?.ClosingBehavior?.disableConfirmation) {
        webAppRef.current.ClosingBehavior.disableConfirmation();
      }
    }, []),
  };

  // Swipe Back Behavior
  const swipeBack = {
    enable: useCallback(() => {
      if (webAppRef.current?.enableVerticalSwipes) {
        webAppRef.current.enableVerticalSwipes();
      }
    }, []),
    disable: useCallback(() => {
      if (webAppRef.current?.disableVerticalSwipes) {
        webAppRef.current.disableVerticalSwipes();
      }
    }, []),
  };

  return {
    isInitialized,
    features,
    secondaryButton,
    bottomBar,
    accelerometer,
    gyroscope,
    deviceOrientation,
    shareStory,
    cloudStorage,
    downloadFile,
    setEmojiStatus,
    requestPhoneAccess,
    closingBehavior,
    swipeBack,
    webApp: webAppRef.current,
  };
}
