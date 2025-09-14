import { useEffect, useState, useCallback } from 'react';
import { telegramSDK } from '@/lib/telegram/telegramSDK';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export function useTelegramAccelerometer(enabled: boolean = false, refreshRate: number = 30) {
  const [accelerometerData, setAccelerometerData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const [orientationData, setOrientationData] = useState<{ alpha: number; beta: number; gamma: number }>({ alpha: 0, beta: 0, gamma: 0 });
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Handle accelerometer data updates
  const handleAccelerometerChange = useCallback((event: CustomEvent) => {
    if (event.detail) {
      setAccelerometerData({
        x: event.detail.x || 0,
        y: event.detail.y || 0,
        z: event.detail.z || 0
      });
    }
  }, []);

  // Handle device orientation updates
  const handleOrientationChange = useCallback((event: CustomEvent) => {
    if (event.detail) {
      setOrientationData({
        alpha: event.detail.alpha || 0,
        beta: event.detail.beta || 0,
        gamma: event.detail.gamma || 0
      });
    }
  }, []);

  // Start accelerometer using optimized SDK
  const startAccelerometer = useCallback(() => {
    const webApp = telegramSDK.getWebApp();
    if (webApp?.Accelerometer && !webApp.Accelerometer.isStarted) {
      try {
        webApp.Accelerometer.start({ refresh_rate: refreshRate });
        webApp.DeviceOrientation?.start({ refresh_rate: refreshRate });
        setIsActive(true);
        console.log('🎯 Accelerometer started at', refreshRate, 'Hz');
      } catch (error) {
        console.error('Failed to start accelerometer:', error);
      }
    }
  }, [refreshRate]);

  // Stop accelerometer using optimized SDK
  const stopAccelerometer = useCallback(() => {
    const webApp = telegramSDK.getWebApp();
    if (webApp?.Accelerometer && webApp.Accelerometer.isStarted) {
      try {
        webApp.Accelerometer.stop();
        webApp.DeviceOrientation?.stop();
        setIsActive(false);
        console.log('🎯 Accelerometer stopped');
      } catch (error) {
        console.error('Failed to stop accelerometer:', error);
      }
    }
  }, []);

  // Lock orientation using optimized SDK
  const lockOrientation = useCallback((orientation: 'portrait' | 'landscape') => {
    const webApp = telegramSDK.getWebApp();
    if (webApp?.lockOrientation) {
      try {
        webApp.lockOrientation(orientation);
        console.log('🔒 Orientation locked to:', orientation);
      } catch (error) {
        console.error('Failed to lock orientation:', error);
      }
    }
  }, []);

  // Unlock orientation using optimized SDK
  const unlockOrientation = useCallback(() => {
    const webApp = telegramSDK.getWebApp();
    if (webApp?.unlockOrientation) {
      try {
        webApp.unlockOrientation();
        console.log('🔓 Orientation unlocked');
      } catch (error) {
        console.error('Failed to unlock orientation:', error);
      }
    }
  }, []);

  // Initialize using optimized SDK
  useEffect(() => {
    const webApp = telegramSDK.getWebApp();
    if (webApp?.Accelerometer) {
      setIsSupported(true);
      
      // Add event listeners
      window.addEventListener('accelerometerChanged', handleAccelerometerChange as EventListener);
      window.addEventListener('deviceOrientationChanged', handleOrientationChange as EventListener);
      
      return () => {
        window.removeEventListener('accelerometerChanged', handleAccelerometerChange as EventListener);
        window.removeEventListener('deviceOrientationChanged', handleOrientationChange as EventListener);
      };
    } else {
      console.log('📱 Accelerometer not supported in this environment');
    }
  }, [handleAccelerometerChange, handleOrientationChange]);

  // Start/stop based on enabled flag
  useEffect(() => {
    if (isSupported) {
      if (enabled) {
        startAccelerometer();
      } else {
        stopAccelerometer();
      }
    }

    return () => {
      if (isSupported && isActive) {
        stopAccelerometer();
      }
    };
  }, [enabled, isSupported, startAccelerometer, stopAccelerometer, isActive]);

  return {
    accelerometerData,
    orientationData,
    isSupported,
    isActive,
    startAccelerometer,
    stopAccelerometer,
    lockOrientation,
    unlockOrientation
  };
}