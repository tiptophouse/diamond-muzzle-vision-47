
import { useState, useEffect, useCallback, useRef } from 'react';
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
    if (!webApp?.Accelerometer || !webApp?.DeviceOrientation) return false;

    try {
      // Start accelerometer with correct parameters
      webApp.Accelerometer.start({ refresh_rate: 60 });
      webApp.DeviceOrientation.start({ refresh_rate: 60 });
      
      setMotionState(prev => ({ ...prev, isActive: true }));
      return true;
    } catch (error) {
      console.error('Failed to start motion tracking:', error);
      return false;
    }
  }, [webApp]);

  const stopMotionTracking = useCallback(() => {
    if (!webApp?.Accelerometer || !webApp?.DeviceOrientation) return;

    webApp.Accelerometer.stop();
    webApp.DeviceOrientation.stop();
    setMotionState(prev => ({ ...prev, isActive: false }));
  }, [webApp]);

  const calibrateMotion = useCallback(() => {
    setMotionState(prev => ({ ...prev, isCalibrated: true }));
  }, []);

  return {
    motionState,
    startMotionTracking,
    stopMotionTracking,
    calibrateMotion,
    isAvailable: !!(webApp?.Accelerometer && webApp?.DeviceOrientation)
  };
}
