
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface EnhancedTelegramFeatures {
  deviceMotion: {
    isSupported: boolean;
    isActive: boolean;
    start: () => Promise<boolean>;
    stop: () => void;
    data: {
      acceleration: { x: number; y: number; z: number };
      orientation: { alpha: number; beta: number; gamma: number };
    };
  };
  biometrics: {
    isSupported: boolean;
    authenticate: () => Promise<boolean>;
  };
  sharing: {
    shareToStory: (mediaUrl: string, text?: string) => Promise<boolean>;
    shareContact: (contact: any) => Promise<boolean>;
  };
  viewport: {
    height: number;
    stableHeight: number;
    safeAreaInset: { top: number; bottom: number; left: number; right: number };
    isExpanded: boolean;
  };
  performance: {
    enableSmoothing: () => void;
    optimizeForIOS: () => void;
  };
}

export function useEnhancedTelegramSDK(): EnhancedTelegramFeatures {
  const { webApp, isReady } = useTelegramWebApp();
  const [motionData, setMotionData] = useState({
    acceleration: { x: 0, y: 0, z: 0 },
    orientation: { alpha: 0, beta: 0, gamma: 0 }
  });
  const [isMotionActive, setIsMotionActive] = useState(false);
  const [viewport, setViewport] = useState({
    height: 0,
    stableHeight: 0,
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    isExpanded: false
  });

  const motionHandlerRef = useRef<((data: any) => void) | null>(null);
  const orientationHandlerRef = useRef<((data: any) => void) | null>(null);

  // iOS detection
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  // Initialize viewport handling with iOS-specific fixes
  useEffect(() => {
    if (!webApp || !isReady) return;

    const updateViewport = () => {
      const height = (webApp as any).viewportHeight || window.innerHeight;
      const stableHeight = (webApp as any).viewportStableHeight || height;
      const insets = (webApp as any).safeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 };

      setViewport({
        height,
        stableHeight,
        safeAreaInset: insets,
        isExpanded: webApp.isExpanded || false
      });

      // iOS-specific viewport fixes
      if (isIOS) {
        // Set CSS custom properties for responsive design
        document.documentElement.style.setProperty('--tg-viewport-height', `${stableHeight}px`);
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${stableHeight}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${insets.top || 0}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${insets.bottom || 0}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-left', `${insets.left || 0}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-right', `${insets.right || 0}px`);

        // Fix body height on iOS to prevent scrolling issues
        document.body.style.height = `${stableHeight}px`;
        document.body.style.maxHeight = `${stableHeight}px`;
        document.body.style.overflow = 'hidden';

        // Prevent zoom on iOS
        const metaViewport = document.querySelector('meta[name=viewport]');
        if (metaViewport) {
          metaViewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          );
        }
      }
    };

    // Initial update
    updateViewport();

    // Listen for viewport changes
    (webApp as any).onEvent?.('viewportChanged', updateViewport);
    (webApp as any).onEvent?.('safeAreaChanged', updateViewport);

    return () => {
      (webApp as any).offEvent?.('viewportChanged', updateViewport);
      (webApp as any).offEvent?.('safeAreaChanged', updateViewport);
    };
  }, [webApp, isReady, isIOS]);

  // Device motion support
  const startDeviceMotion = useCallback(async (): Promise<boolean> => {
    if (!webApp || isMotionActive) return false;

    try {
      // Try Telegram's new Device APIs first (Bot API 8.0+)
      if ((webApp as any).isVersionAtLeast?.('8.0')) {
        if ((webApp as any).Accelerometer) {
          const accelerometer = (webApp as any).Accelerometer;
          
          motionHandlerRef.current = (data: any) => {
            setMotionData(prev => ({
              ...prev,
              acceleration: { x: data.x || 0, y: data.y || 0, z: data.z || 0 }
            }));
          };
          
          (webApp as any).onEvent?.('accelerometerChanged', motionHandlerRef.current);
          accelerometer.start({ refresh_rate: 60 });
        }

        if ((webApp as any).DeviceOrientation) {
          const orientation = (webApp as any).DeviceOrientation;
          
          orientationHandlerRef.current = (data: any) => {
            setMotionData(prev => ({
              ...prev,
              orientation: { 
                alpha: data.alpha || 0, 
                beta: data.beta || 0, 
                gamma: data.gamma || 0 
              }
            }));
          };
          
          (webApp as any).onEvent?.('deviceOrientationChanged', orientationHandlerRef.current);
          orientation.start({ refresh_rate: 60, need_absolute: false });
        }

        setIsMotionActive(true);
        return true;
      }

      // Fallback to standard DeviceMotion API
      if (typeof DeviceMotionEvent !== 'undefined') {
        // Request permission on iOS 13+
        if (isIOS && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission !== 'granted') return false;
        }

        const handleMotion = (event: DeviceMotionEvent) => {
          setMotionData({
            acceleration: {
              x: event.acceleration?.x || 0,
              y: event.acceleration?.y || 0,
              z: event.acceleration?.z || 0
            },
            orientation: {
              alpha: event.rotationRate?.alpha || 0,
              beta: event.rotationRate?.beta || 0,
              gamma: event.rotationRate?.gamma || 0
            }
          });
        };

        window.addEventListener('devicemotion', handleMotion);
        setIsMotionActive(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to start device motion:', error);
      return false;
    }
  }, [webApp, isMotionActive, isIOS]);

  const stopDeviceMotion = useCallback(() => {
    if (!isMotionActive) return;

    try {
      // Stop Telegram APIs
      if ((webApp as any).Accelerometer) {
        (webApp as any).Accelerometer.stop();
        if (motionHandlerRef.current) {
          (webApp as any).offEvent?.('accelerometerChanged', motionHandlerRef.current);
        }
      }

      if ((webApp as any).DeviceOrientation) {
        (webApp as any).DeviceOrientation.stop();
        if (orientationHandlerRef.current) {
          (webApp as any).offEvent?.('deviceOrientationChanged', orientationHandlerRef.current);
        }
      }

      // Stop standard API
      window.removeEventListener('devicemotion', () => {});

      setIsMotionActive(false);
    } catch (error) {
      console.error('Failed to stop device motion:', error);
    }
  }, [webApp, isMotionActive]);

  // Biometric authentication
  const authenticateWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (!webApp) return false;

    try {
      // Check if biometric authentication is supported
      if ((webApp as any).BiometricManager) {
        const biometric = (webApp as any).BiometricManager;
        if (biometric.isInited && biometric.isBiometricAvailable) {
          const result = await new Promise<boolean>((resolve) => {
            biometric.authenticate({
              reason: 'Authenticate to access your diamond collection'
            }, (success: boolean) => {
              resolve(success);
            });
          });
          return result;
        }
      }
      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, [webApp]);

  // Enhanced sharing capabilities
  const shareToStory = useCallback(async (mediaUrl: string, text?: string): Promise<boolean> => {
    if (!webApp) return false;

    try {
      if ((webApp as any).shareToStory) {
        (webApp as any).shareToStory(mediaUrl, {
          text: text || '',
          widget_link: {
            url: window.location.href,
            name: 'BrilliantBot'
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Share to story failed:', error);
      return false;
    }
  }, [webApp]);

  const shareContact = useCallback(async (contact: any): Promise<boolean> => {
    if (!webApp) return false;

    try {
      if ((webApp as any).shareContact) {
        (webApp as any).shareContact(contact);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Share contact failed:', error);
      return false;
    }
  }, [webApp]);

  // Performance optimizations
  const enableSmoothing = useCallback(() => {
    if (!isIOS) return;

    // Enable hardware acceleration for smooth scrolling on iOS
    document.body.style.webkitOverflowScrolling = 'touch';
    document.body.style.overflowScrolling = 'touch';

    // Optimize touch events
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
  }, [isIOS]);

  const optimizeForIOS = useCallback(() => {
    if (!isIOS) return;

    // Prevent rubber band scrolling
    document.body.addEventListener('touchmove', (e) => {
      if ((e.target as Element).closest('.scrollable')) return;
      e.preventDefault();
    }, { passive: false });

    // Fix iOS viewport bugs
    const fixViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    fixViewportHeight();
    window.addEventListener('resize', fixViewportHeight);
    window.addEventListener('orientationchange', fixViewportHeight);
  }, [isIOS]);

  // Initialize performance optimizations
  useEffect(() => {
    if (isIOS && isReady) {
      enableSmoothing();
      optimizeForIOS();
    }
  }, [isIOS, isReady, enableSmoothing, optimizeForIOS]);

  return {
    deviceMotion: {
      isSupported: !!(webApp && ((webApp as any).Accelerometer || typeof DeviceMotionEvent !== 'undefined')),
      isActive: isMotionActive,
      start: startDeviceMotion,
      stop: stopDeviceMotion,
      data: motionData
    },
    biometrics: {
      isSupported: !!((webApp as any)?.BiometricManager?.isBiometricAvailable),
      authenticate: authenticateWithBiometrics
    },
    sharing: {
      shareToStory,
      shareContact
    },
    viewport,
    performance: {
      enableSmoothing,
      optimizeForIOS
    }
  };
}
