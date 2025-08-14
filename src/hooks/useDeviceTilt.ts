
import { useEffect, useState } from 'react';

type Tilt = { alpha: number; beta: number; gamma: number; absolute: boolean };

export function useDeviceTilt(opts?: { refreshMs?: number; needAbsolute?: boolean }) {
  const { refreshMs = 50, needAbsolute = false } = opts || {};
  const [tilt, setTilt] = useState<Tilt>({ alpha: 0, beta: 0, gamma: 0, absolute: false });
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    // Check if Telegram Mini App API is available (Bot API 8.0+)
    if (tg?.isVersionAtLeast?.('8.0') && tg.DeviceOrientation) {
      setIsSupported(true);
      
      const DO = tg.DeviceOrientation;
      const onChanged = () => {
        setTilt({ 
          alpha: DO.alpha || 0, 
          beta: DO.beta || 0, 
          gamma: DO.gamma || 0, 
          absolute: !!DO.absolute 
        });
      };

      // Listen for device orientation changes
      tg.onEvent('deviceOrientationChanged', onChanged);
      
      // Start tracking with user-friendly settings
      DO.start({ refresh_rate: refreshMs, need_absolute: needAbsolute });
      setIsActive(true);
      
      // Optional: stabilize UX by locking current orientation
      tg.lockOrientation?.();

      return () => {
        tg.offEvent?.('deviceOrientationChanged', onChanged);
        DO.stop();
        tg.unlockOrientation?.();
        setIsActive(false);
      };
    }

    // Fallback: standard browser DeviceOrientation (iOS needs permission)
    let listening = false;
    const handler = (e: DeviceOrientationEvent) => {
      setTilt({
        alpha: ((e.alpha ?? 0) * Math.PI) / 180,
        beta: ((e.beta ?? 0) * Math.PI) / 180,
        gamma: ((e.gamma ?? 0) * Math.PI) / 180,
        absolute: !!e.absolute,
      });
    };

    (async () => {
      try {
        const anyDOE = (DeviceOrientationEvent as any);
        if (typeof anyDOE?.requestPermission === 'function') {
          // Must be triggered by a user gesture in iOS
          const res = await anyDOE.requestPermission();
          if (res !== 'granted') return;
        }
        setIsSupported(true);
      } catch (error) {
        console.warn('Device orientation not supported:', error);
        return;
      }
      
      window.addEventListener('deviceorientation', handler, true);
      listening = true;
      setIsActive(true);
    })();

    return () => {
      if (listening) {
        window.removeEventListener('deviceorientation', handler, true);
        setIsActive(false);
      }
    };
  }, [refreshMs, needAbsolute]);

  const startMotion = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.isVersionAtLeast?.('8.0') && tg.DeviceOrientation) {
      try {
        await tg.DeviceOrientation.start({ refresh_rate: refreshMs, need_absolute: needAbsolute });
        setIsActive(true);
        return true;
      } catch (error) {
        console.error('Failed to start Telegram motion:', error);
        return false;
      }
    }
    return false;
  };

  const stopMotion = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.DeviceOrientation) {
      tg.DeviceOrientation.stop();
      setIsActive(false);
    }
  };

  return { 
    tilt, // {alpha,beta,gamma} in radians
    isActive,
    isSupported,
    startMotion,
    stopMotion
  };
}
