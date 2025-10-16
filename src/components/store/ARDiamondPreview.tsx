/**
 * AR-Style Diamond Preview
 * Place and rotate diamonds in real-world context using device orientation
 * Simulates augmented reality experience within Telegram Mini App
 */

import { useState, useEffect, useRef } from 'react';
import { useTelegramAdvanced } from '@/hooks/useTelegramAdvanced';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Maximize2, Hand, Grid3x3, Sparkles, MoveVertical } from 'lucide-react';

interface ARDiamondPreviewProps {
  imageUrl: string;
  stockNumber: string;
  shape: string;
  carat: number;
}

export function ARDiamondPreview({
  imageUrl,
  stockNumber,
  shape,
  carat
}: ARDiamondPreviewProps) {
  const { deviceOrientation, features, isInitialized } = useTelegramAdvanced();
  const { haptic } = useTelegramSDK();
  
  const [isARMode, setIsARMode] = useState(false);
  const [diamondPosition, setDiamondPosition] = useState({ x: 50, y: 50, z: 0 });
  const [diamondRotation, setDiamondRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const initialOrientationRef = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);

  const hasARSupport = features.hasDeviceOrientation;

  useEffect(() => {
    if (!isARMode || !hasARSupport) return;

    const started = deviceOrientation.start((data) => {
      // Calibrate on first reading
      if (!initialOrientationRef.current) {
        initialOrientationRef.current = {
          alpha: data.alpha || 0,
          beta: data.beta || 0,
          gamma: data.gamma || 0
        };
        return;
      }

      const initial = initialOrientationRef.current;
      
      // Calculate relative rotation from initial position
      const relativeAlpha = (data.alpha || 0) - initial.alpha;
      const relativeBeta = (data.beta || 0) - initial.beta;
      const relativeGamma = (data.gamma || 0) - initial.gamma;

      // Convert device orientation to diamond rotation
      setDiamondRotation({
        x: relativeBeta * 0.8,
        y: relativeAlpha * 0.5,
        z: relativeGamma * 0.3
      });

      // Move diamond based on device tilt (AR positioning)
      setDiamondPosition(prev => ({
        x: Math.max(10, Math.min(90, 50 + relativeGamma * 0.8)),
        y: Math.max(20, Math.min(80, 50 - relativeBeta * 0.5)),
        z: prev.z
      }));

      // Scale based on tilt intensity (simulate depth)
      const tiltIntensity = Math.abs(relativeBeta) + Math.abs(relativeGamma);
      setScale(1 + (tiltIntensity * 0.002));

    }, false, 60);

    if (!started) {
      console.warn('Failed to start AR mode');
      setIsARMode(false);
    }

    return () => {
      deviceOrientation.stop();
    };
  }, [isARMode, hasARSupport, deviceOrientation]);

  const startARMode = () => {
    if (!hasARSupport) {
      haptic?.notification?.('error');
      return;
    }

    haptic?.impact?.('heavy');
    initialOrientationRef.current = null;
    setIsARMode(true);
  };

  const stopARMode = () => {
    haptic?.impact?.('light');
    deviceOrientation.stop();
    setIsARMode(false);
    initialOrientationRef.current = null;
    setDiamondPosition({ x: 50, y: 50, z: 0 });
    setDiamondRotation({ x: 0, y: 0, z: 0 });
    setScale(1);
  };

  const adjustHeight = (direction: 'up' | 'down') => {
    haptic?.selection?.();
    setDiamondPosition(prev => ({
      ...prev,
      z: prev.z + (direction === 'up' ? 20 : -20)
    }));
  };

  if (!hasARSupport) {
    return (
      <Card className="p-6 text-center bg-slate-100">
        <Camera className="h-12 w-12 mx-auto mb-3 text-slate-400" />
        <p className="text-sm text-slate-600">
          AR Preview requires device orientation sensors
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* AR Canvas */}
      <div 
        ref={canvasRef}
        className="relative h-[500px] bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden"
      >
        {/* AR Grid Background */}
        {isARMode && (
          <div className="absolute inset-0 opacity-20">
            <Grid3x3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full text-slate-400" 
                     strokeWidth={0.5} />
          </div>
        )}

        {/* Diamond in AR Space */}
        <div
          className="absolute transition-all duration-100"
          style={{
            left: `${diamondPosition.x}%`,
            top: `${diamondPosition.y}%`,
            transform: `
              translate(-50%, -50%)
              translateZ(${diamondPosition.z}px)
              rotateX(${diamondRotation.x}deg)
              rotateY(${diamondRotation.y}deg)
              rotateZ(${diamondRotation.z}deg)
              scale(${scale})
            `,
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            filter: isARMode ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' : 'none',
          }}
        >
          <img
            src={imageUrl}
            alt={`AR preview: ${carat}ct ${shape}`}
            className="w-32 h-32 object-contain"
            style={{
              filter: `brightness(${1.1 + scale * 0.1}) contrast(1.1)`,
            }}
          />

          {/* Diamond Info Label */}
          {isARMode && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-white px-3 py-1 rounded-full text-xs">
              {carat}ct {shape}
            </div>
          )}

          {/* Sparkle Particles */}
          {isARMode && (
            <>
              <div 
                className="absolute top-0 right-0 w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                style={{ animationDuration: '2s' }}
              />
              <div 
                className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
            </>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge 
            variant={isARMode ? "default" : "secondary"}
            className="flex items-center gap-2 px-3 py-1.5"
          >
            {isARMode ? (
              <>
                <Camera className="h-3 w-3 animate-pulse" />
                <span className="text-xs font-medium">AR Active</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span className="text-xs font-medium">AR Preview</span>
              </>
            )}
          </Badge>
        </div>

        {/* Instructions Overlay */}
        {!isARMode && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg max-w-xs">
              <Camera className="h-12 w-12 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">AR Diamond Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View and rotate the diamond in 3D space by moving your device
              </p>
              <Button onClick={startARMode} className="gap-2">
                <Hand className="h-4 w-4" />
                Start AR Mode
              </Button>
            </div>
          </div>
        )}

        {/* Height Controls (when AR active) */}
        {isARMode && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <Button
              onClick={() => adjustHeight('up')}
              size="sm"
              variant="outline"
              className="bg-white/90 hover:bg-white"
            >
              <MoveVertical className="h-4 w-4 rotate-180" />
            </Button>
            <Button
              onClick={() => adjustHeight('down')}
              size="sm"
              variant="outline"
              className="bg-white/90 hover:bg-white"
            >
              <MoveVertical className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="p-4 bg-slate-50 border-t">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium">{carat}ct {shape} Diamond</p>
            <p className="text-xs text-muted-foreground">Stock #{stockNumber}</p>
          </div>

          <Button
            onClick={isARMode ? stopARMode : startARMode}
            variant={isARMode ? "destructive" : "default"}
            size="sm"
            className="gap-2"
          >
            <Camera className={`h-4 w-4 ${isARMode ? 'animate-pulse' : ''}`} />
            {isARMode ? 'Stop AR' : 'Start AR'}
          </Button>
        </div>

        {/* AR Instructions */}
        {isARMode && (
          <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 p-3 rounded space-y-1">
            <p className="font-medium text-blue-900 mb-1">🎯 Move your device to:</p>
            <ul className="space-y-0.5">
              <li>• Tilt left/right to rotate the diamond</li>
              <li>• Tilt forward/back to change viewing angle</li>
              <li>• Use buttons to adjust height</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
