
import { useState, useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface DeviceOrientationData {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

interface MotionQuality {
  stability: number;
  smoothness: number;
  responsiveness: number;
}

interface EnhancedMotionState {
  accelerometer: AccelerometerData;
  orientation: DeviceOrientationData;
  quality: MotionQuality;
  isCalibrated: boolean;
  isActive: boolean;
}

export function useEnhancedTelegramMotion() {
  const { webApp } = useTelegramWebApp();
  const [motionState, setMotionState] = useState<EnhancedMotionState>({
    accelerometer: { x: 0, y: 0, z: 0 },
    orientation: { alpha: null, beta: null, gamma: null },
    quality: { stability: 0, smoothness: 0, responsiveness: 0 },
    isCalibrated: false,
    isActive: false
  });

  const startMotionTracking = useCallback(() => {
    if (!webApp) return false;

    try {
      // Check if accelerometer is available
      if (webApp.Accelerometer && typeof webApp.Accelerometer.start === 'function') {
        webApp.Accelerometer.start({ refresh_rate: 60 });
      }
      
      // Check if device orientation is available
      if (webApp.DeviceOrientation && typeof webApp.DeviceOrientation.start === 'function') {
        webApp.DeviceOrientation.start({ refresh_rate: 60 });
      }
      
      setMotionState(prev => ({ ...prev, isActive: true }));
      return true;
    } catch (error) {
      console.error('Failed to start motion tracking:', error);
      return false;
    }
  }, [webApp]);

  const stopMotionTracking = useCallback(() => {
    if (!webApp) return;

    try {
      if (webApp.Accelerometer && typeof webApp.Accelerometer.stop === 'function') {
        webApp.Accelerometer.stop();
      }
      
      if (webApp.DeviceOrientation && typeof webApp.DeviceOrientation.stop === 'function') {
        webApp.DeviceOrientation.stop();
      }
      
      setMotionState(prev => ({ ...prev, isActive: false }));
    } catch (error) {
      console.error('Failed to stop motion tracking:', error);
    }
  }, [webApp]);

  const calibrateMotion = useCallback(() => {
    setMotionState(prev => ({ ...prev, isCalibrated: true }));
  }, []);

  const isAvailable = !!(webApp?.Accelerometer && webApp?.DeviceOrientation);

  return {
    motionState,
    startMotionTracking,
    stopMotionTracking,
    calibrateMotion,
    isAvailable
  };
}
