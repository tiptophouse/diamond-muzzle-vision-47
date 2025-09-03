import { useEffect, useState, useCallback, useRef } from 'react';
import { TelegramWebApp } from '../types/telegram';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface OrientationData {
  alpha: number;
  beta: number;  
  gamma: number;
}

export function useTelegramAccelerometer(enabled: boolean = false, refreshRate: number = 60) {
  const [accelerometerData, setAccelerometerData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const [orientationData, setOrientationData] = useState<OrientationData>({ alpha: 0, beta: 0, gamma: 0 });
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const lastUpdateRef = useRef<number>(0);
  const smoothingRef = useRef<OrientationData>({ alpha: 0, beta: 0, gamma: 0 });

  // Smooth motion data to reduce jitter
  const smoothMotionData = useCallback((newData: OrientationData): OrientationData => {
    const now = performance.now();
    const deltaTime = now - lastUpdateRef.current;
    lastUpdateRef.current = now;
    
    if (deltaTime === 0) return smoothingRef.current;
    
    const smoothingFactor = Math.min(deltaTime / 16.67, 1) * 0.15; // Smooth but responsive
    
    smoothingRef.current = {
      alpha: lerp(smoothingRef.current.alpha, newData.alpha, smoothingFactor),
      beta: lerp(smoothingRef.current.beta, newData.beta, smoothingFactor),
      gamma: lerp(smoothingRef.current.gamma, newData.gamma, smoothingFactor)
    };
    
    return smoothingRef.current;
  }, []);

  // Linear interpolation helper
  const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };

  // Handle Telegram accelerometer events
  const handleAccelerometerChange = useCallback((event: CustomEvent | Event) => {
    if (!enabled) return;
    
    const detail = (event as CustomEvent).detail;
    if (detail) {
      setAccelerometerData({
        x: detail.x || 0,
        y: detail.y || 0,
        z: detail.z || 0
      });
    }
  }, [enabled]);

  // Handle Telegram device orientation events
  const handleTelegramOrientationChange = useCallback((event: CustomEvent | Event) => {
    if (!enabled) return;
    
    const detail = (event as CustomEvent).detail;
    if (detail) {
      const newData = {
        alpha: detail.alpha || 0,
        beta: detail.beta || 0,
        gamma: detail.gamma || 0
      };
      
      const smoothedData = smoothMotionData(newData);
      setOrientationData(smoothedData);
      
      // Dispatch custom event for components
      window.dispatchEvent(new CustomEvent('motionUpdate', { 
        detail: smoothedData 
      }));
    }
  }, [enabled, smoothMotionData]);

  // Handle standard DeviceOrientationEvent (fallback)
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!enabled) return;
    
    const newData = {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    };
    
    const smoothedData = smoothMotionData(newData);
    setOrientationData(smoothedData);
    
    // Dispatch custom event for components
    window.dispatchEvent(new CustomEvent('motionUpdate', { 
      detail: smoothedData 
    }));
  }, [enabled, smoothMotionData]);

  // Request motion permissions
  const requestMotionPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we're in Telegram WebApp
      const tg = window.Telegram?.WebApp as TelegramWebApp;
      if (tg?.Accelerometer) {
        console.log('🎯 Using Telegram WebApp motion API');
        return true;
      }

      // For iOS devices, request permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        return permission === 'granted';
      }
      
      // For other devices, assume permission is granted
      return true;
    } catch (error) {
      console.error('Motion permission request failed:', error);
      return false;
    }
  }, []);

  // Start accelerometer with proper permission handling
  const startAccelerometer = useCallback(async () => {
    if (isActive) return;
    
    const hasPermission = await requestMotionPermission();
    setPermissionGranted(hasPermission);
    
    if (!hasPermission) {
      console.warn('❌ Motion permission not granted');
      return;
    }
    
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    
    // Try Telegram API first
    if (tg?.Accelerometer) {
      try {
        // Modern Telegram API
        if ('start' in tg.Accelerometer) {
          tg.Accelerometer.start({ refresh_rate: refreshRate });
        }
        if (tg.DeviceOrientation && 'start' in tg.DeviceOrientation) {
          tg.DeviceOrientation.start({ refresh_rate: refreshRate });
        }
        
        // Add Telegram event listeners
        window.addEventListener('accelerometerChanged', handleAccelerometerChange);
        window.addEventListener('deviceOrientationChanged', handleTelegramOrientationChange);
        
        setIsActive(true);
        console.log('🎯 Telegram accelerometer started at', refreshRate, 'Hz');
        return;
      } catch (error) {
        console.error('Telegram accelerometer failed:', error);
      }
    }
    
    // Fallback to standard Web API
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      setIsActive(true);
      console.log('📱 Standard motion API started');
    } else {
      console.warn('❌ No motion API available');
    }
  }, [refreshRate, handleAccelerometerChange, handleTelegramOrientationChange, handleDeviceOrientation, requestMotionPermission, isActive]);

  // Stop accelerometer
  const stopAccelerometer = useCallback(() => {
    if (!isActive) return;
    
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    
    // Stop Telegram APIs
    if (tg?.Accelerometer) {
      try {
        if ('stop' in tg.Accelerometer) {
          tg.Accelerometer.stop();
        }
        if (tg.DeviceOrientation && 'stop' in tg.DeviceOrientation) {
          tg.DeviceOrientation.stop();
        }
      } catch (error) {
        console.error('Error stopping Telegram APIs:', error);
      }
    }
    
    // Remove all event listeners
    window.removeEventListener('accelerometerChanged', handleAccelerometerChange);
    window.removeEventListener('deviceOrientationChanged', handleTelegramOrientationChange);
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
    
    setIsActive(false);
    console.log('🎯 Accelerometer stopped');
  }, [handleAccelerometerChange, handleTelegramOrientationChange, handleDeviceOrientation, isActive]);

  // Lock orientation for better motion control
  const lockOrientation = useCallback((orientation: 'portrait' | 'landscape') => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg?.lockOrientation) {
      try {
        tg.lockOrientation(orientation);
        console.log('🔒 Orientation locked to:', orientation);
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

  // Start/stop based on enabled flag
  useEffect(() => {
    if (enabled && isSupported) {
      startAccelerometer();
    } else if (!enabled && isActive) {
      stopAccelerometer();
    }

    return () => {
      if (isActive) {
        stopAccelerometer();
      }
    };
  }, [enabled, isSupported, startAccelerometer, stopAccelerometer, isActive]);

  return {
    accelerometerData,
    orientationData,
    isSupported,
    isActive,
    permissionGranted,
    startAccelerometer,
    stopAccelerometer,
    lockOrientation,
    unlockOrientation
  };
}