import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TelegramWebApp } from '@/types/telegram';

interface MotionData {
  accelerometer: { x: number; y: number; z: number };
  orientation: { alpha: number; beta: number; gamma: number };
}

interface TelegramMotionContextType {
  motionData: MotionData;
  isSupported: boolean;
  isActive: boolean;
  startMotion: () => void;
  stopMotion: () => void;
}

const TelegramMotionContext = createContext<TelegramMotionContextType | null>(null);

export function TelegramMotionProvider({ children }: { children: ReactNode }) {
  const [motionData, setMotionData] = useState<MotionData>({
    accelerometer: { x: 0, y: 0, z: 0 },
    orientation: { alpha: 0, beta: 0, gamma: 0 }
  });
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Handle accelerometer updates
  const handleAccelerometerChange = useCallback((event: CustomEvent) => {
    if (event.detail) {
      setMotionData(prev => ({
        ...prev,
        accelerometer: {
          x: event.detail.x || 0,
          y: event.detail.y || 0,
          z: event.detail.z || 0
        }
      }));
    }
  }, []);

  // Handle orientation updates
  const handleOrientationChange = useCallback((event: CustomEvent) => {
    if (event.detail) {
      setMotionData(prev => ({
        ...prev,
        orientation: {
          alpha: event.detail.alpha || 0,
          beta: event.detail.beta || 0,
          gamma: event.detail.gamma || 0
        }
      }));
    }
  }, []);

  // Start motion sensors
  const startMotion = useCallback(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg?.Accelerometer && !tg.Accelerometer.isStarted) {
      try {
        tg.Accelerometer.start({ refresh_rate: 20 }); // 20Hz for performance
        tg.DeviceOrientation?.start({ refresh_rate: 20 });
        setIsActive(true);
      } catch (error) {
        console.error('Failed to start motion sensors:', error);
      }
    }
  }, []);

  // Stop motion sensors
  const stopMotion = useCallback(() => {
    const tg = window.Telegram?.WebApp as TelegramWebApp;
    if (tg?.Accelerometer && tg.Accelerometer.isStarted) {
      try {
        tg.Accelerometer.stop();
        tg.DeviceOrientation?.stop();
        setIsActive(false);
      } catch (error) {
        console.error('Failed to stop motion sensors:', error);
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
      
      // Auto-start motion
      startMotion();
      
      return () => {
        window.removeEventListener('accelerometerChanged', handleAccelerometerChange as EventListener);
        window.removeEventListener('deviceOrientationChanged', handleOrientationChange as EventListener);
        stopMotion();
      };
    }
  }, [handleAccelerometerChange, handleOrientationChange, startMotion, stopMotion]);

  return (
    <TelegramMotionContext.Provider 
      value={{ 
        motionData, 
        isSupported, 
        isActive, 
        startMotion, 
        stopMotion 
      }}
    >
      {children}
    </TelegramMotionContext.Provider>
  );
}

export function useGlobalMotion() {
  const context = useContext(TelegramMotionContext);
  if (!context) {
    throw new Error('useGlobalMotion must be used within TelegramMotionProvider');
  }
  return context;
}
