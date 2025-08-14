
import { useState, useCallback, useEffect, useRef } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface MotionData {
  alpha: number;
  beta: number;
  gamma: number;
}

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface MotionQuality {
  stability: number;
  smoothness: number;
  responsiveness: number;
}

interface NativeMotionState {
  orientation: MotionData;
  accelerometer: AccelerometerData;
  quality: MotionQuality;
  isActive: boolean;
  isSupported: boolean;
  hasPermission: boolean;
}

export function useNativeTelegramMotion() {
  const { webApp } = useTelegramWebApp();
  const [motionState, setMotionState] = useState<NativeMotionState>({
    orientation: { alpha: 0, beta: 0, gamma: 0 },
    accelerometer: { x: 0, y: 0, z: 0 },
    quality: { stability: 0, smoothness: 0, responsiveness: 100 },
    isActive: false,
    isSupported: false,
    hasPermission: false
  });

  const motionDataRef = useRef<MotionData[]>([]);
  const qualityTimerRef = useRef<NodeJS.Timeout>();

  // Check if native motion is supported (Bot API 8.0+)
  const checkSupport = useCallback(() => {
    if (!webApp) return false;
    
    // Check version support
    const hasVersionSupport = webApp.version >= '8.0' || 
      (typeof (webApp as any).isVersionAtLeast === 'function' && 
       (webApp as any).isVersionAtLeast('8.0'));
    
    // Check for native objects
    const hasNativeObjects = !!(webApp.DeviceOrientation && webApp.Accelerometer);
    
    return hasVersionSupport && hasNativeObjects;
  }, [webApp]);

  // Calculate motion quality metrics
  const calculateQuality = useCallback(() => {
    if (motionDataRef.current.length < 10) return;

    const recent = motionDataRef.current.slice(-10);
    
    // Stability: lower variance = higher stability
    const alphaVariance = recent.reduce((sum, d, i, arr) => {
      if (i === 0) return sum;
      const diff = Math.abs(d.alpha - arr[i-1].alpha);
      return sum + diff;
    }, 0) / (recent.length - 1);
    
    const stability = Math.max(0, 100 - (alphaVariance * 10));
    
    // Smoothness: consistent change rate
    const smoothness = Math.max(0, 100 - (alphaVariance * 5));
    
    setMotionState(prev => ({
      ...prev,
      quality: {
        stability: Math.round(stability),
        smoothness: Math.round(smoothness),
        responsiveness: 100
      }
    }));
  }, []);

  // Handle orientation change events
  const handleOrientationChange = useCallback((data: any) => {
    const motionData = {
      alpha: data.alpha || 0,
      beta: data.beta || 0,
      gamma: data.gamma || 0
    };

    // Store for quality calculation
    motionDataRef.current.push(motionData);
    if (motionDataRef.current.length > 50) {
      motionDataRef.current = motionDataRef.current.slice(-30);
    }

    setMotionState(prev => ({
      ...prev,
      orientation: motionData
    }));
  }, []);

  // Handle accelerometer change events
  const handleAccelerometerChange = useCallback((data: any) => {
    setMotionState(prev => ({
      ...prev,
      accelerometer: {
        x: data.x || 0,
        y: data.y || 0,
        z: data.z || 0
      }
    }));
  }, []);

  // Start native motion tracking (requires user gesture)
  const startMotion = useCallback(async () => {
    if (!webApp || !checkSupport()) {
      console.warn('Native motion not supported');
      return false;
    }

    try {
      // Start device orientation with native API
      const orientationStarted = await webApp.DeviceOrientation?.start({
        refresh_rate: 60,
        need_absolute: false
      });

      // Start accelerometer
      const accelerometerStarted = await webApp.Accelerometer?.start({
        refresh_rate: 60
      });

      if (orientationStarted || accelerometerStarted) {
        // Set up event listeners
        if (typeof webApp.DeviceOrientation?.onChange === 'function') {
          webApp.DeviceOrientation.onChange(handleOrientationChange);
        }
        
        if (typeof webApp.Accelerometer?.onChange === 'function') {
          webApp.Accelerometer.onChange(handleAccelerometerChange);
        }

        setMotionState(prev => ({
          ...prev,
          isActive: true,
          hasPermission: true
        }));

        // Start quality monitoring
        qualityTimerRef.current = setInterval(calculateQuality, 1000);

        console.log('✅ Native Telegram motion started');
        return true;
      }
    } catch (error) {
      console.error('Failed to start native motion:', error);
    }

    return false;
  }, [webApp, checkSupport, handleOrientationChange, handleAccelerometerChange, calculateQuality]);

  // Stop motion tracking
  const stopMotion = useCallback(() => {
    if (!webApp) return;

    try {
      webApp.DeviceOrientation?.stop();
      webApp.Accelerometer?.stop();
      
      if (qualityTimerRef.current) {
        clearInterval(qualityTimerRef.current);
      }

      setMotionState(prev => ({
        ...prev,
        isActive: false
      }));

      console.log('🛑 Native Telegram motion stopped');
    } catch (error) {
      console.error('Failed to stop native motion:', error);
    }
  }, [webApp]);

  // Initialize support check
  useEffect(() => {
    const isSupported = checkSupport();
    setMotionState(prev => ({
      ...prev,
      isSupported
    }));
  }, [checkSupport]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qualityTimerRef.current) {
        clearInterval(qualityTimerRef.current);
      }
      stopMotion();
    };
  }, [stopMotion]);

  return {
    motionState,
    startMotion,
    stopMotion,
    isSupported: motionState.isSupported,
    isActive: motionState.isActive,
    quality: motionState.quality
  };
}
