import { useEffect, useState, useCallback, useRef } from 'react';
import { TelegramWebApp } from '../types/telegram';

// Enhanced motion data with sensor fusion
interface EnhancedMotionData {
  // Accelerometer (m/s²)
  acceleration: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  
  // Device Orientation (degrees)
  orientation: {
    alpha: number; // Compass heading (0-360°)
    beta: number;  // Front-back tilt (-180 to 180°)
    gamma: number; // Left-right tilt (-90 to 90°)
    absolute: boolean;
  };
  
  // Gyroscope (rad/s) - when available
  gyroscope?: {
    x: number;
    y: number;
    z: number;
  };
  
  // Computed motion state
  motionState: {
    isMoving: boolean;
    intensity: 'still' | 'gentle' | 'moderate' | 'active' | 'intense';
    tiltAngle: number;
    compassHeading: number;
  };
  
  // Quality indicators
  quality: {
    accelerometerActive: boolean;
    orientationActive: boolean;
    gyroscopeActive: boolean;
    dataAge: number; // ms since last update
    reliability: number; // 0-1 confidence score
  };
}

interface MotionConfig {
  refreshRate: number; // 1-60 Hz
  enableAccelerometer: boolean;
  enableOrientation: boolean;
  enableGyroscope: boolean;
  needAbsoluteOrientation: boolean;
  sensitivity: number; // 0.1-2.0
  smoothing: boolean;
  deadzone: number; // Ignore micro-movements
}

const DEFAULT_CONFIG: MotionConfig = {
  refreshRate: 60,
  enableAccelerometer: true,
  enableOrientation: true,
  enableGyroscope: true,
  needAbsoluteOrientation: true,
  sensitivity: 1.0,
  smoothing: true,
  deadzone: 0.05
};

export function useEnhancedTelegramMotion(enabled: boolean = false, config: Partial<MotionConfig> = {}) {
  const [motionData, setMotionData] = useState<EnhancedMotionData>({
    acceleration: { x: 0, y: 0, z: 0, magnitude: 0 },
    orientation: { alpha: 0, beta: 0, gamma: 0, absolute: false },
    motionState: { 
      isMoving: false, 
      intensity: 'still', 
      tiltAngle: 0, 
      compassHeading: 0 
    },
    quality: { 
      accelerometerActive: false, 
      orientationActive: false, 
      gyroscopeActive: false, 
      dataAge: 0, 
      reliability: 0 
    }
  });

  const [isSupported, setIsSupported] = useState({
    accelerometer: false,
    orientation: false,
    gyroscope: false
  });

  const [isActive, setIsActive] = useState(false);
  const [calibrationData, setCalibrationData] = useState({ x: 0, y: 0, z: 0 });
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const lastUpdateRef = useRef<number>(Date.now());
  const smoothingBufferRef = useRef<any[]>([]);
  const calibrationSamplesRef = useRef<any[]>([]);

  // Enhanced data processing with sensor fusion
  const processMotionData = useCallback((rawData: any) => {
    const now = Date.now();
    const dataAge = now - lastUpdateRef.current;
    lastUpdateRef.current = now;

    // Apply calibration offset
    const calibratedAccel = {
      x: (rawData.acceleration?.x || 0) - calibrationData.x,
      y: (rawData.acceleration?.y || 0) - calibrationData.y,
      z: (rawData.acceleration?.z || 0) - calibrationData.z
    };

    // Calculate magnitude
    const magnitude = Math.sqrt(
      calibratedAccel.x ** 2 + 
      calibratedAccel.y ** 2 + 
      calibratedAccel.z ** 2
    );

    // Apply smoothing filter
    if (finalConfig.smoothing) {
      smoothingBufferRef.current.push({
        acceleration: calibratedAccel,
        orientation: rawData.orientation || { alpha: 0, beta: 0, gamma: 0, absolute: false },
        gyroscope: rawData.gyroscope,
        timestamp: now
      });

      // Keep only last 5 samples for smoothing
      if (smoothingBufferRef.current.length > 5) {
        smoothingBufferRef.current.shift();
      }

      // Calculate smoothed values
      const smoothed = smoothingBufferRef.current.reduce((acc, sample) => {
        acc.x += sample.acceleration.x;
        acc.y += sample.acceleration.y;
        acc.z += sample.acceleration.z;
        acc.alpha += sample.orientation.alpha;
        acc.beta += sample.orientation.beta;
        acc.gamma += sample.orientation.gamma;
        return acc;
      }, { x: 0, y: 0, z: 0, alpha: 0, beta: 0, gamma: 0 });

      const sampleCount = smoothingBufferRef.current.length;
      calibratedAccel.x = smoothed.x / sampleCount;
      calibratedAccel.y = smoothed.y / sampleCount;
      calibratedAccel.z = smoothed.z / sampleCount;
      rawData.orientation.alpha = smoothed.alpha / sampleCount;
      rawData.orientation.beta = smoothed.beta / sampleCount;
      rawData.orientation.gamma = smoothed.gamma / sampleCount;
    }

    // Apply deadzone
    if (magnitude < finalConfig.deadzone) {
      calibratedAccel.x = calibratedAccel.y = calibratedAccel.z = 0;
    }

    // Apply sensitivity scaling
    calibratedAccel.x *= finalConfig.sensitivity;
    calibratedAccel.y *= finalConfig.sensitivity;
    calibratedAccel.z *= finalConfig.sensitivity;

    // Calculate motion intensity
    const getMotionIntensity = (mag: number): EnhancedMotionData['motionState']['intensity'] => {
      if (mag < 0.1) return 'still';
      if (mag < 0.5) return 'gentle';
      if (mag < 1.0) return 'moderate';
      if (mag < 2.0) return 'active';
      return 'intense';
    };

    // Calculate tilt angle (device orientation relative to gravity)
    const tiltAngle = Math.atan2(
      Math.sqrt(calibratedAccel.x ** 2 + calibratedAccel.y ** 2),
      calibratedAccel.z
    ) * (180 / Math.PI);

    // Calculate reliability score
    const reliability = Math.min(1, Math.max(0, 
      (isSupported.accelerometer ? 0.4 : 0) +
      (isSupported.orientation ? 0.4 : 0) +
      (isSupported.gyroscope ? 0.2 : 0) -
      (dataAge > 100 ? 0.2 : 0) // Penalize old data
    ));

    const enhancedData: EnhancedMotionData = {
      acceleration: {
        x: calibratedAccel.x,
        y: calibratedAccel.y,
        z: calibratedAccel.z,
        magnitude
      },
      orientation: rawData.orientation || { alpha: 0, beta: 0, gamma: 0, absolute: false },
      gyroscope: rawData.gyroscope,
      motionState: {
        isMoving: magnitude > finalConfig.deadzone,
        intensity: getMotionIntensity(magnitude),
        tiltAngle,
        compassHeading: rawData.orientation?.alpha || 0
      },
      quality: {
        accelerometerActive: isSupported.accelerometer,
        orientationActive: isSupported.orientation,
        gyroscopeActive: isSupported.gyroscope,
        dataAge,
        reliability
      }
    };

    setMotionData(enhancedData);
  }, [finalConfig, calibrationData, isSupported]);

  // Enhanced event handlers
  const handleAccelerometerChange = useCallback((event: CustomEvent) => {
    if (event.detail) {
      processMotionData({
        acceleration: {
          x: event.detail.x || 0,
          y: event.detail.y || 0,
          z: event.detail.z || 0
        }
      });
    }
  }, [processMotionData]);

  const handleOrientationChange = useCallback((event: CustomEvent) => {
    if (event.detail) {
      processMotionData({
        orientation: {
          alpha: event.detail.alpha || 0,
          beta: event.detail.beta || 0,
          gamma: event.detail.gamma || 0,
          absolute: event.detail.absolute || false
        }
      });
    }
  }, [processMotionData]);

  const handleGyroscopeChange = useCallback((event: CustomEvent) => {
    if (event.detail) {
      processMotionData({
        gyroscope: {
          x: event.detail.x || 0,
          y: event.detail.y || 0,
          z: event.detail.z || 0
        }
      });
    }
  }, [processMotionData]);

  // Calibration function
  const calibrateMotion = useCallback(async (samples: number = 50): Promise<boolean> => {
    return new Promise((resolve) => {
      calibrationSamplesRef.current = [];
      let sampleCount = 0;

      const calibrationListener = (event: CustomEvent) => {
        if (event.detail && sampleCount < samples) {
          calibrationSamplesRef.current.push({
            x: event.detail.x || 0,
            y: event.detail.y || 0,
            z: event.detail.z || 0
          });
          sampleCount++;

          if (sampleCount >= samples) {
            // Calculate average for calibration offset
            const avgCalibration = calibrationSamplesRef.current.reduce(
              (acc, sample) => ({
                x: acc.x + sample.x,
                y: acc.y + sample.y,
                z: acc.z + sample.z
              }),
              { x: 0, y: 0, z: 0 }
            );

            setCalibrationData({
              x: avgCalibration.x / samples,
              y: avgCalibration.y / samples,
              z: avgCalibration.z / samples
            });

            window.removeEventListener('accelerometerChanged', calibrationListener as EventListener);
            console.log('🎯 Motion calibration completed:', avgCalibration);
            resolve(true);
          }
        }
      };

      window.addEventListener('accelerometerChanged', calibrationListener as EventListener);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('accelerometerChanged', calibrationListener as EventListener);
        resolve(false);
      }, 5000);
    });
  }, []);

  // Start enhanced motion tracking
  const startMotionTracking = useCallback(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (!tg) return false;

    try {
      let started = false;

      // Start accelerometer with enhanced config
      if (finalConfig.enableAccelerometer && tg.Accelerometer && !tg.Accelerometer.isStarted) {
        tg.Accelerometer.start({ 
          refresh_rate: finalConfig.refreshRate 
        });
        started = true;
        console.log(`🚀 Enhanced Accelerometer started at ${finalConfig.refreshRate}Hz`);
      }

      // Start device orientation with enhanced config
      if (finalConfig.enableOrientation && tg.DeviceOrientation && !tg.DeviceOrientation.isStarted) {
        tg.DeviceOrientation.start({ 
          refresh_rate: finalConfig.refreshRate,
          need_absolute: finalConfig.needAbsoluteOrientation
        });
        started = true;
        console.log(`🧭 Enhanced DeviceOrientation started at ${finalConfig.refreshRate}Hz`);
      }

      // Start gyroscope if available
      if (finalConfig.enableGyroscope && (tg as any).Gyroscope && !(tg as any).Gyroscope.isStarted) {
        (tg as any).Gyroscope.start({ 
          refresh_rate: finalConfig.refreshRate 
        });
        started = true;
        console.log(`🌀 Gyroscope started at ${finalConfig.refreshRate}Hz`);
      }

      if (started) {
        setIsActive(true);
      }

      return started;
    } catch (error) {
      console.error('❌ Failed to start enhanced motion tracking:', error);
      return false;
    }
  }, [finalConfig]);

  // Stop motion tracking
  const stopMotionTracking = useCallback(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (!tg) return;

    try {
      if (tg.Accelerometer?.isStarted) {
        tg.Accelerometer.stop();
      }
      if (tg.DeviceOrientation?.isStarted) {
        tg.DeviceOrientation.stop();
      }
      if ((tg as any).Gyroscope?.isStarted) {
        (tg as any).Gyroscope.stop();
      }

      setIsActive(false);
      console.log('🛑 Enhanced motion tracking stopped');
    } catch (error) {
      console.error('❌ Failed to stop motion tracking:', error);
    }
  }, []);

  // Initialize and check support
  useEffect(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg) {
      setIsSupported({
        accelerometer: !!tg.Accelerometer,
        orientation: !!tg.DeviceOrientation,
        gyroscope: !!(tg as any).Gyroscope
      });

      // Register enhanced event listeners
      window.addEventListener('accelerometerChanged', handleAccelerometerChange as EventListener);
      window.addEventListener('deviceOrientationChanged', handleOrientationChange as EventListener);
      window.addEventListener('gyroscopeChanged', handleGyroscopeChange as EventListener);

      return () => {
        window.removeEventListener('accelerometerChanged', handleAccelerometerChange as EventListener);
        window.removeEventListener('deviceOrientationChanged', handleOrientationChange as EventListener);
        window.removeEventListener('gyroscopeChanged', handleGyroscopeChange as EventListener);
      };
    }
  }, [handleAccelerometerChange, handleOrientationChange, handleGyroscopeChange]);

  // Auto start/stop based on enabled state
  useEffect(() => {
    if (enabled && isSupported.accelerometer) {
      startMotionTracking();
    } else if (!enabled && isActive) {
      stopMotionTracking();
    }

    return () => {
      if (isActive) {
        stopMotionTracking();
      }
    };
  }, [enabled, isSupported.accelerometer, startMotionTracking, stopMotionTracking, isActive]);

  return {
    motionData,
    isSupported,
    isActive,
    config: finalConfig,
    startMotionTracking,
    stopMotionTracking,
    calibrateMotion,
    resetCalibration: () => setCalibrationData({ x: 0, y: 0, z: 0 })
  };
}
