import { useState, useEffect, useRef, useCallback } from 'react';
import { Smartphone, Hand, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface TiltDiamondControllerProps {
  children: React.ReactNode;
  className?: string;
  onModeChange?: (isTiltMode: boolean) => void;
  sensitivity?: number;
  onSensitivityChange?: (sensitivity: number) => void;
}

interface MotionData {
  alpha: number; // Z-axis rotation (compass heading)
  beta: number;  // X-axis rotation (front-to-back tilt)
  gamma: number; // Y-axis rotation (left-to-right tilt)
}

export function TiltDiamondController({ 
  children, 
  className = '',
  onModeChange,
  sensitivity = 0.5,
  onSensitivityChange
}: TiltDiamondControllerProps) {
  const [motionData, setMotionData] = useState<MotionData>({ alpha: 0, beta: 0, gamma: 0 });
  const [isTiltMode, setIsTiltMode] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [currentSensitivity, setCurrentSensitivity] = useState(sensitivity);
  
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();
  const motionRef = useRef<MotionData>({ alpha: 0, beta: 0, gamma: 0 });
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  
  // Smoothing for motion data (using lerp)
  const smoothMotionData = useCallback((newData: MotionData, deltaTime: number) => {
    const smoothingFactor = Math.min(deltaTime / 16.67, 1) * currentSensitivity; // 60fps target
    
    motionRef.current = {
      alpha: lerp(motionRef.current.alpha, newData.alpha, smoothingFactor),
      beta: lerp(motionRef.current.beta, newData.beta, smoothingFactor * 0.8), // Slightly less sensitive for X
      gamma: lerp(motionRef.current.gamma, newData.gamma, smoothingFactor)
    };
    
    return motionRef.current;
  }, [currentSensitivity]);

  // Linear interpolation helper
  const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };

  // Handle Telegram WebApp motion events
  const handleTelegramMotion = useCallback((event: CustomEvent) => {
    if (!isTiltMode) return;
    
    const now = performance.now();
    const deltaTime = now - lastUpdateRef.current;
    
    if (deltaTime < 8.33) return; // Throttle to ~120fps max
    
    const detail = event.detail;
    if (detail) {
      const newMotionData = {
        alpha: detail.alpha || 0,
        beta: detail.beta || 0,
        gamma: detail.gamma || 0
      };
      
      const smoothedData = smoothMotionData(newMotionData, deltaTime);
      setMotionData(smoothedData);
      lastUpdateRef.current = now;
    }
  }, [isTiltMode, smoothMotionData]);

  // Handle standard DeviceOrientationEvent (fallback)
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!isTiltMode) return;
    
    const now = performance.now();
    const deltaTime = now - lastUpdateRef.current;
    
    if (deltaTime < 8.33) return; // Throttle to ~120fps max
    
    const newMotionData = {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    };
    
    const smoothedData = smoothMotionData(newMotionData, deltaTime);
    setMotionData(smoothedData);
    lastUpdateRef.current = now;
  }, [isTiltMode, smoothMotionData]);

  // Request motion permissions
  const requestMotionPermission = async (): Promise<boolean> => {
    try {
      // Check if we're in Telegram WebApp
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.Accelerometer) {
        console.log('🎯 Using Telegram WebApp motion API');
        return true;
      }

      // Fallback to standard Web APIs
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        return permission === 'granted';
      }
      
      // Android/other browsers - assume permission granted
      return true;
    } catch (error) {
      console.error('Motion permission request failed:', error);
      return false;
    }
  };

  // Initialize motion tracking
  const initializeMotionTracking = useCallback(async () => {
    const hasPermission = await requestMotionPermission();
    setPermissionGranted(hasPermission);

    if (!hasPermission) {
      notificationOccurred('error');
      return false;
    }

    // Try Telegram WebApp API first
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.Accelerometer) {
      try {
        tg.Accelerometer.start({ refresh_rate: 60 });
        tg.DeviceOrientation?.start({ refresh_rate: 60 });
        
        // Listen for Telegram events
        window.addEventListener('deviceOrientationChanged', handleTelegramMotion as EventListener);
        console.log('🎯 Telegram motion API initialized');
        return true;
      } catch (error) {
        console.error('Telegram motion API failed:', error);
      }
    }

    // Fallback to standard Web API
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      console.log('📱 Standard motion API initialized');
      return true;
    }

    return false;
  }, [handleTelegramMotion, handleDeviceOrientation, notificationOccurred]);

  // Cleanup motion tracking
  const cleanupMotionTracking = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    // Stop Telegram APIs
    if (tg?.Accelerometer) {
      try {
        tg.Accelerometer.stop();
        tg.DeviceOrientation?.stop();
      } catch (error) {
        console.error('Error stopping Telegram motion APIs:', error);
      }
    }

    // Remove event listeners
    window.removeEventListener('deviceOrientationChanged', handleTelegramMotion as EventListener);
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [handleTelegramMotion, handleDeviceOrientation]);

  // Toggle tilt mode
  const toggleTiltMode = async () => {
    if (!isTiltMode && !permissionGranted) {
      const initialized = await initializeMotionTracking();
      if (!initialized) {
        notificationOccurred('error');
        return;
      }
    }

    const newTiltMode = !isTiltMode;
    setIsTiltMode(newTiltMode);
    
    if (newTiltMode) {
      impactOccurred('medium');
      if (!localStorage.getItem('tilt-tutorial-seen')) {
        setShowTutorial(true);
        localStorage.setItem('tilt-tutorial-seen', 'true');
      }
    } else {
      impactOccurred('light');
      cleanupMotionTracking();
    }
    
    selectionChanged();
    onModeChange?.(newTiltMode);
  };

  // Reset diamond position
  const resetPosition = () => {
    motionRef.current = { alpha: 0, beta: 0, gamma: 0 };
    setMotionData({ alpha: 0, beta: 0, gamma: 0 });
    impactOccurred('light');
  };

  // Check if motion is supported
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const hasSupport = !!(tg?.Accelerometer || window.DeviceOrientationEvent);
    setIsSupported(hasSupport);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMotionTracking();
    };
  }, [cleanupMotionTracking]);

  // Handle sensitivity changes
  const handleSensitivityChange = (value: number[]) => {
    const newSensitivity = value[0];
    setCurrentSensitivity(newSensitivity);
    onSensitivityChange?.(newSensitivity);
    selectionChanged();
  };

  // Calculate diamond transform
  const getDiamondTransform = () => {
    if (!isTiltMode) return '';
    
    // Apply rotation limits and convert to CSS transform
    const maxRotation = 25; // Maximum rotation in degrees
    const rotateX = Math.max(-maxRotation, Math.min(maxRotation, motionData.beta * 0.8));
    const rotateY = Math.max(-maxRotation, Math.min(maxRotation, motionData.gamma * 0.8));
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Content with Motion Transform */}
        <div 
          className="transition-transform duration-75 ease-out"
          style={{
            transform: getDiamondTransform(),
            transformStyle: 'preserve-3d'
          }}
        >
          {children}
        </div>

        {/* Control Panel */}
        {isSupported && (
          <div className="absolute top-3 right-3 flex gap-2">
            {/* Mode Toggle */}
            <Button
              size="sm"
              variant={isTiltMode ? "default" : "outline"}
              onClick={toggleTiltMode}
              className={`h-9 px-3 rounded-lg transition-all duration-300 ${
                isTiltMode 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'bg-white/90 backdrop-blur-sm border-white/50 text-slate-600 hover:bg-white'
              }`}
            >
              {isTiltMode ? <Smartphone className="h-4 w-4 mr-1" /> : <Hand className="h-4 w-4 mr-1" />}
              <span className="text-xs font-medium">
                {isTiltMode ? 'Tilt' : 'Touch'}
              </span>
            </Button>

            {/* Reset Button */}
            {isTiltMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={resetPosition}
                className="h-9 px-2 bg-white/90 backdrop-blur-sm border-white/50 text-slate-600 hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            {/* Settings Button */}
            {isTiltMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="h-9 px-2 bg-white/90 backdrop-blur-sm border-white/50 text-slate-600 hover:bg-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Mode Indicator */}
        {isSupported && (
          <div className="absolute bottom-3 left-3">
            <Badge 
              className={`text-xs px-2 py-1 ${
                isTiltMode
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/90 text-slate-600 border border-slate-200'
              }`}
            >
              {isTiltMode ? '📱 Tilt Mode' : '👆 Touch Mode'}
            </Badge>
          </div>
        )}
      </div>

      {/* Tutorial Modal */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">🎯 Tilt Mode Activated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="text-4xl">📱</div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Tilt your device to rotate the diamond in 3D space!
              </p>
              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
                <p>• Tilt forward/backward for X-axis rotation</p>
                <p>• Tilt left/right for Y-axis rotation</p>
                <p>• Use the reset button to center the view</p>
              </div>
            </div>
            <Button onClick={() => setShowTutorial(false)} className="w-full">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Motion Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sensitivity</label>
              <Slider
                value={[currentSensitivity]}
                onValueChange={handleSensitivityChange}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Less sensitive</span>
                <span>More sensitive</span>
              </div>
            </div>
            <Button onClick={() => setShowSettings(false)} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}