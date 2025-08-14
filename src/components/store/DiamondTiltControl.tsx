
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, RotateCcw } from 'lucide-react';
import { useDeviceTilt } from '@/hooks/useDeviceTilt';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface DiamondTiltControlProps {
  frames: number;
  setFrame: (index: number) => void;
  sensitivity?: number;
  maxTiltDeg?: number;
  className?: string;
}

export function DiamondTiltControl({
  frames,
  setFrame,
  sensitivity = 0.9,
  maxTiltDeg = 45,
  className = ""
}: DiamondTiltControlProps) {
  const { tilt, isActive, isSupported, startMotion, stopMotion } = useDeviceTilt({ refreshMs: 33 });
  const { hapticFeedback } = useTelegramWebApp();
  const [zero, setZero] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [isEnabled, setIsEnabled] = useState(false);
  const targetIdx = useRef(0);
  const currentIdx = useRef(0);
  const raf = useRef<number>();

  // Use "gamma" (left/right tilt) for horizontal rotation; subtract zero point
  useEffect(() => {
    if (!isEnabled || !isActive) return;

    const g = tilt.gamma - zero.gamma; // radians
    const max = (maxTiltDeg * Math.PI) / 180; // radians
    const clamped = Math.max(-max, Math.min(max, g));
    
    // Map [-max, +max] -> [0, 1]
    const t = (clamped / (2 * max)) + 0.5;
    
    // Wrap frames and apply sensitivity
    targetIdx.current = (frames - 1) * (t * sensitivity + (1 - sensitivity) * 0.5);
  }, [tilt.gamma, frames, maxTiltDeg, sensitivity, zero.gamma, isEnabled, isActive]);

  // Smoothly animate toward the target frame
  useEffect(() => {
    if (!isEnabled) return;

    const tick = () => {
      currentIdx.current += (targetIdx.current - currentIdx.current) * 0.15; // smoothing
      const idx = Math.round((currentIdx.current % frames + frames) % frames);
      setFrame(idx);
      raf.current = requestAnimationFrame(tick);
    };
    
    raf.current = requestAnimationFrame(tick);
    
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, [frames, setFrame, isEnabled]);

  const toggleTilt = async () => {
    if (!isSupported) {
      hapticFeedback.notification('error');
      return;
    }

    if (isEnabled) {
      stopMotion();
      setIsEnabled(false);
      hapticFeedback.impact('light');
    } else {
      const started = await startMotion();
      if (started || isActive) {
        setIsEnabled(true);
        setZero({ alpha: tilt.alpha, beta: tilt.beta, gamma: tilt.gamma });
        hapticFeedback.impact('medium');
      } else {
        hapticFeedback.notification('error');
      }
    }
  };

  const recenter = () => {
    setZero({ alpha: tilt.alpha, beta: tilt.beta, gamma: tilt.gamma });
    hapticFeedback.selection();
  };

  if (!isSupported) return null;

  return (
    <div className={`fixed left-3 right-3 bottom-3 rounded-2xl bg-black/70 text-white p-3 backdrop-blur-md border border-white/10 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isEnabled ? 'Tilt your phone to rotate' : 'Motion Control'}
          </span>
          {isEnabled && (
            <Badge className="bg-green-500 text-white text-xs">
              Active
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          {isEnabled && (
            <Button
              onClick={recenter}
              size="sm"
              variant="outline"
              className="h-8 px-2 bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            onClick={toggleTilt}
            size="sm"
            variant={isEnabled ? "default" : "outline"}
            className={`h-8 px-3 ${
              isEnabled 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
          >
            {isEnabled ? 'Disable' : 'Enable'} Tilt
          </Button>
        </div>
      </div>
    </div>
  );
}
