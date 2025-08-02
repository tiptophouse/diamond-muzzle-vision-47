import { useEffect, useState, useCallback, useRef } from 'react';
import { TelegramWebApp } from '../types/telegram';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export function useTelegramAccelerometer(enabled: boolean = false, refreshRate: number = 30) {
  const [accelerometerData, setAccelerometerData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const [smoothedData, setSmoothedData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const [orientationData, setOrientationData] = useState<{ alpha: number; beta: number; gamma: number }>({ alpha: 0, beta: 0, gamma: 0 });
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const calibrationData = useRef<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const smoothingBuffer = useRef<AccelerometerData[]>([]);

  // Calibrate accelerometer (auto-calibration after 1 second)
  const calibrateAccelerometer = useCallback(() => {
    if (!isCalibrated && accelerometerData.x !== 0) {
      calibrationData.current = { ...accelerometerData };
      setIsCalibrated(true);
      console.log('🎯 Accelerometer calibrated:', calibrationData.current);
    }
  }, [accelerometerData, isCalibrated]);

  // Apply smoothing filter to accelerometer data
  const smoothAccelerometerData = useCallback((newData: AccelerometerData) => {
    const bufferSize = 5;
    smoothingBuffer.current.push(newData);
    if (smoothingBuffer.current.length > bufferSize) {
      smoothingBuffer.current.shift();
    }

    // Calculate rolling average
    const avg = smoothingBuffer.current.reduce(
      (acc, data) => ({
        x: acc.x + data.x,
        y: acc.y + data.y,
        z: acc.z + data.z
      }),
      { x: 0, y: 0, z: 0 }
    );

    const smoothed = {
      x: avg.x / smoothingBuffer.current.length,
      y: avg.y / smoothingBuffer.current.length,
      z: avg.z / smoothingBuffer.current.length
    };

    // Apply calibration offset
    if (isCalibrated) {
      smoothed.x -= calibrationData.current.x;
      smoothed.y -= calibrationData.current.y;
      smoothed.z -= calibrationData.current.z;
    }

    setSmoothedData(smoothed);
  }, [isCalibrated]);

  // Handle accelerometer data updates
  const handleAccelerometerChange = useCallback((event: CustomEvent) => {
    if (event.detail) {
      const rawData = {
        x: event.detail.x || 0,
        y: event.detail.y || 0,
        z: event.detail.z || 0
      };
      setAccelerometerData(rawData);
      smoothAccelerometerData(rawData);
    }
  }, [smoothAccelerometerData]);

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
    if (tg?.Accelerometer && !tg.Accelerometer.isStarted) {
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
    if (tg?.Accelerometer && tg.Accelerometer.isStarted) {
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

  // Auto-calibration after 1 second of data
  useEffect(() => {
    if (isActive && !isCalibrated) {
      const timer = setTimeout(calibrateAccelerometer, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, isCalibrated, calibrateAccelerometer]);

  // Start/stop based on enabled flag
  useEffect(() => {
    if (isSupported) {
      if (enabled) {
        startAccelerometer();
        setIsCalibrated(false); // Reset calibration when starting
        smoothingBuffer.current = []; // Clear smoothing buffer
      } else {
        stopAccelerometer();
      }
    }

    return () => {
      if (isSupported && isActive) {
        stopAccelerometer();
      }
    };
  }, [enabled, isSupported, startAccelerometer, stopAccelerometer, isActive, calibrateAccelerometer]);

  return {
    accelerometerData: smoothedData, // Return smoothed data
    rawAccelerometerData: accelerometerData, // Also provide raw data
    orientationData,
    isSupported,
    isActive,
    isCalibrated,
    startAccelerometer,
    stopAccelerometer,
    lockOrientation,
    unlockOrientation,
    calibrateAccelerometer
  };
}