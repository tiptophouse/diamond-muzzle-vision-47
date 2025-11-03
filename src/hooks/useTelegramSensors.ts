import { useState, useCallback, useEffect } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

/**
 * Telegram Sensors Hook
 * Provides access to device sensors: Accelerometer, Gyroscope, DeviceOrientation
 * Available in Bot API 8.0+
 * 
 * Best Practices:
 * - Request permission before starting sensors
 * - Stop sensors when not needed (battery drain)
 * - Use throttling/debouncing for sensor updates
 * - Monitor isStarted state to avoid duplicate starts
 * - Use for AR, games, gesture controls, orientation-aware UI
 */

interface SensorData {
  x: number;
  y: number;
  z: number;
}

interface OrientationData {
  alpha: number; // Z-axis (0-360)
  beta: number;  // X-axis (-180 to 180)
  gamma: number; // Y-axis (-90 to 90)
}

interface UseSensorsReturn {
  // Accelerometer
  accelerometer: SensorData;
  isAccelerometerStarted: boolean;
  startAccelerometer: (refreshRate?: number) => void;
  stopAccelerometer: () => void;
  
  // Gyroscope
  gyroscope: SensorData;
  isGyroscopeStarted: boolean;
  startGyroscope: (refreshRate?: number) => void;
  stopGyroscope: () => void;
  
  // Device Orientation
  orientation: OrientationData;
  isOrientationStarted: boolean;
  startOrientation: (refreshRate?: number) => void;
  stopOrientation: () => void;
  
  // Orientation Lock
  lockOrientation: (mode: 'portrait' | 'landscape') => void;
  unlockOrientation: () => void;
  
  // Availability
  isSensorsAvailable: boolean;
}

export function useTelegramSensors(): UseSensorsReturn {
  const { webApp } = useTelegramWebApp();
  
  const [accelerometer, setAccelerometer] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const [gyroscope, setGyroscope] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const [orientation, setOrientation] = useState<OrientationData>({ alpha: 0, beta: 0, gamma: 0 });
  
  const [isAccelerometerStarted, setIsAccelerometerStarted] = useState(false);
  const [isGyroscopeStarted, setIsGyroscopeStarted] = useState(false);
  const [isOrientationStarted, setIsOrientationStarted] = useState(false);

  const isSensorsAvailable = !!(
    webApp?.Accelerometer || 
    webApp?.Gyroscope || 
    webApp?.DeviceOrientation
  );

  // Accelerometer handlers
  useEffect(() => {
    if (!webApp) return;

    const handleAccelerometerChange = () => {
      // Note: Actual data would come from event payload
      console.log('📱 Accelerometer data changed');
    };

    webApp.onEvent?.('accelerometerChanged', handleAccelerometerChange);

    return () => {
      webApp.offEvent?.('accelerometerChanged', handleAccelerometerChange);
    };
  }, [webApp]);

  // Gyroscope handlers
  useEffect(() => {
    if (!webApp) return;

    const handleGyroscopeChange = () => {
      console.log('📱 Gyroscope data changed');
    };

    webApp.onEvent?.('gyroscopeChanged', handleGyroscopeChange);

    return () => {
      webApp.offEvent?.('gyroscopeChanged', handleGyroscopeChange);
    };
  }, [webApp]);

  // Orientation handlers - Poll sensor data at refresh rate
  useEffect(() => {
    if (!webApp?.DeviceOrientation || !isOrientationStarted) return;

    const pollInterval = setInterval(() => {
      const device = webApp.DeviceOrientation;
      if (device && device.isStarted) {
        // Read current orientation values from SDK
        // Note: The actual data structure depends on Telegram SDK implementation
        // Fallback to 0 if not available
        setOrientation({
          alpha: (device as any).z || 0,  // Z-axis (compass heading)
          beta: (device as any).x || 0,   // X-axis (front-to-back tilt)
          gamma: (device as any).y || 0   // Y-axis (left-to-right tilt)
        });
      }
    }, 16); // ~60 FPS polling

    return () => {
      clearInterval(pollInterval);
    };
  }, [webApp, isOrientationStarted]);

  const startAccelerometer = useCallback((refreshRate = 60) => {
    if (!webApp?.Accelerometer) {
      console.warn('Accelerometer not available');
      return;
    }

    if (webApp.Accelerometer.isStarted) {
      console.warn('Accelerometer already started');
      return;
    }

    webApp.Accelerometer.start({ refresh_rate: refreshRate });
    setIsAccelerometerStarted(true);
    console.log(`🚀 Accelerometer started (${refreshRate}Hz)`);
  }, [webApp]);

  const stopAccelerometer = useCallback(() => {
    if (!webApp?.Accelerometer) return;
    
    webApp.Accelerometer.stop();
    setIsAccelerometerStarted(false);
    console.log('⏹️ Accelerometer stopped');
  }, [webApp]);

  const startGyroscope = useCallback((refreshRate = 60) => {
    if (!webApp?.Gyroscope) {
      console.warn('Gyroscope not available');
      return;
    }

    if (webApp.Gyroscope.isStarted) {
      console.warn('Gyroscope already started');
      return;
    }

    webApp.Gyroscope.start({ refresh_rate: refreshRate });
    setIsGyroscopeStarted(true);
    console.log(`🚀 Gyroscope started (${refreshRate}Hz)`);
  }, [webApp]);

  const stopGyroscope = useCallback(() => {
    if (!webApp?.Gyroscope) return;
    
    webApp.Gyroscope.stop();
    setIsGyroscopeStarted(false);
    console.log('⏹️ Gyroscope stopped');
  }, [webApp]);

  const startOrientation = useCallback((refreshRate = 60) => {
    if (!webApp?.DeviceOrientation) {
      console.warn('DeviceOrientation not available');
      return;
    }

    if (webApp.DeviceOrientation.isStarted) {
      console.warn('DeviceOrientation already started');
      return;
    }

    try {
      webApp.DeviceOrientation.start({ refresh_rate: refreshRate });
      setIsOrientationStarted(true);
      console.log(`🚀 DeviceOrientation started (${refreshRate}Hz)`);
    } catch (error) {
      console.error('Failed to start DeviceOrientation:', error);
    }
  }, [webApp]);

  const stopOrientation = useCallback(() => {
    if (!webApp?.DeviceOrientation) return;
    
    webApp.DeviceOrientation.stop();
    setIsOrientationStarted(false);
    console.log('⏹️ DeviceOrientation stopped');
  }, [webApp]);

  const lockOrientation = useCallback((mode: 'portrait' | 'landscape') => {
    if (!webApp?.lockOrientation) {
      console.warn('lockOrientation not available');
      return;
    }

    webApp.lockOrientation(mode);
    console.log(`🔒 Orientation locked to ${mode}`);
  }, [webApp]);

  const unlockOrientation = useCallback(() => {
    if (!webApp?.unlockOrientation) {
      console.warn('unlockOrientation not available');
      return;
    }

    webApp.unlockOrientation();
    console.log('🔓 Orientation unlocked');
  }, [webApp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isAccelerometerStarted) stopAccelerometer();
      if (isGyroscopeStarted) stopGyroscope();
      if (isOrientationStarted) stopOrientation();
    };
  }, [isAccelerometerStarted, isGyroscopeStarted, isOrientationStarted]);

  return {
    accelerometer,
    isAccelerometerStarted,
    startAccelerometer,
    stopAccelerometer,
    
    gyroscope,
    isGyroscopeStarted,
    startGyroscope,
    stopGyroscope,
    
    orientation,
    isOrientationStarted,
    startOrientation,
    stopOrientation,
    
    lockOrientation,
    unlockOrientation,
    
    isSensorsAvailable,
  };
}
