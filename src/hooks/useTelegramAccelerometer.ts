
import { useEffect, useState, useCallback } from 'react';
import { TelegramWebApp } from '../types/telegram';

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

  // Start accelerometer
  const startAccelerometer = useCallback(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg?.Accelerometer) {
      try {
        tg.Accelerometer.start({ refresh_rate: refreshRate });
        tg.DeviceOrientation?.start({ refresh_rate: refreshRate });
        setIsActive(true);
        console.log('🎯 Accelerometer started at', refreshRate, 'Hz');
      } catch (error) {
        console.error('Failed to start accelerometer:', error);
      }
    }
  }, [refreshRate]);

  // Stop accelerometer
  const stopAccelerometer = useCallback(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg?.Accelerometer) {
      try {
        tg.Accelerometer.stop();
        tg.DeviceOrientation?.stop();
        setIsActive(false);
        console.log('🎯 Accelerometer stopped');
      } catch (error) {
        console.error('Failed to stop accelerometer:', error);
      }
    }
  }, []);

  // Lock orientation for better motion control
  const lockOrientation = useCallback(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg?.lockOrientation) {
      try {
        tg.lockOrientation();
        console.log('🔒 Orientation locked');
      } catch (error) {
        console.error('Failed to lock orientation:', error);
      }
    }
  }, []);

  // Unlock orientation
  const unlockOrientation = useCallback(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg?.unlockOrientation) {
      try {
        tg.unlockOrientation();
        console.log('🔓 Orientation unlocked');
      } catch (error) {
        console.error('Failed to unlock orientation:', error);
      }
    }
  }, []);

  // Initialize
  useEffect(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg?.Accelerometer) {
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
