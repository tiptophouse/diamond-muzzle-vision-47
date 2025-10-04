/**
 * Motion-Enhanced Diamond Viewer
 * Uses Telegram Accelerometer & Gyroscope for immersive 3D diamond viewing
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTelegramAdvanced } from '@/hooks/useTelegramAdvanced';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, RotateCw, Sparkles, Eye } from 'lucide-react';

interface MotionDiamondViewerProps {
  imageUrl: string;
  stockNumber: string;
  shape: string;
  onMotionSupported?: (supported: boolean) => void;
}

export function MotionDiamondViewer({ 
  imageUrl, 
  stockNumber, 
  shape,
  onMotionSupported 
}: MotionDiamondViewerProps) {
  const { 
    accelerometer, 
    gyroscope, 
    deviceOrientation, 
    features,
    isInitialized 
  } = useTelegramAdvanced();
  const { haptic } = useTelegramSDK();
  
  const [isMotionActive, setIsMotionActive] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const motionDataRef = useRef({ x: 0, y: 0, z: 0 });

  const hasMotionSupport = features.hasAccelerometer || 
                           features.hasGyroscope || 
                           features.hasDeviceOrientation;

  useEffect(() => {
    if (onMotionSupported) {
      onMotionSupported(hasMotionSupport);
    }
  }, [hasMotionSupport, onMotionSupported]);

  const startMotionTracking = () => {
    if (!isInitialized || !hasMotionSupport) return;

    haptic?.impact?.('medium');

    // Try Device Orientation first (most accurate)
    if (features.hasDeviceOrientation) {
      const started = deviceOrientation.start((data) => {
        // Convert orientation to rotation angles
        const rotX = data.beta || 0;  // Front-to-back tilt (-180 to 180)
        const rotY = data.gamma || 0; // Left-to-right tilt (-90 to 90)
        const rotZ = data.alpha || 0; // Compass direction (0 to 360)
        
        setRotation({ x: rotX, y: rotY, z: rotZ });
        
        // Calculate tilt for parallax effect
        setTilt({
          x: Math.max(-20, Math.min(20, rotY / 4)),
          y: Math.max(-20, Math.min(20, rotX / 8))
        });
      }, false, 60);

      if (started) {
        setIsMotionActive(true);
        console.log('✅ Device Orientation tracking started');
        return;
      }
    }

    // Fallback to Gyroscope
    if (features.hasGyroscope) {
      const started = gyroscope.start((data) => {
        motionDataRef.current = {
          x: motionDataRef.current.x + data.x * 0.1,
          y: motionDataRef.current.y + data.y * 0.1,
          z: motionDataRef.current.z + data.z * 0.1,
        };

        setRotation(motionDataRef.current);
        setTilt({
          x: Math.max(-20, Math.min(20, motionDataRef.current.y)),
          y: Math.max(-20, Math.min(20, motionDataRef.current.x))
        });
      }, 60);

      if (started) {
        setIsMotionActive(true);
        console.log('✅ Gyroscope tracking started');
        return;
      }
    }

    // Fallback to Accelerometer
    if (features.hasAccelerometer) {
      const started = accelerometer.start((data) => {
        setTilt({
          x: Math.max(-20, Math.min(20, data.x * 10)),
          y: Math.max(-20, Math.min(20, data.y * 10))
        });
      }, 60);

      if (started) {
        setIsMotionActive(true);
        console.log('✅ Accelerometer tracking started');
      }
    }
  };

  const stopMotionTracking = () => {
    haptic?.impact?.('light');
    
    deviceOrientation.stop();
    gyroscope.stop();
    accelerometer.stop();
    
    setIsMotionActive(false);
    setRotation({ x: 0, y: 0, z: 0 });
    setTilt({ x: 0, y: 0 });
    motionDataRef.current = { x: 0, y: 0, z: 0 };
    
    console.log('🛑 Motion tracking stopped');
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isMotionActive) {
        stopMotionTracking();
      }
    };
  }, [isMotionActive]);

  if (!hasMotionSupport) {
    return (
      <Card className="p-6 text-center">
        <img 
          src={imageUrl} 
          alt={`${shape} diamond - ${stockNumber}`}
          className="w-full h-auto rounded-lg mb-4"
        />
        <p className="text-sm text-muted-foreground">
          Motion tracking not available on this device
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
      {/* 3D Diamond Container */}
      <div 
        ref={imageRef}
        className="relative h-96 perspective-1000"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background Glow Effect */}
        <div 
          className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent blur-3xl"
          style={{
            transform: `translate(${tilt.x}px, ${tilt.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />

        {/* Diamond Image with 3D Transform */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: isMotionActive 
              ? `
                  rotateX(${rotation.x * 0.5}deg) 
                  rotateY(${rotation.y * 0.5}deg) 
                  rotateZ(${rotation.z * 0.1}deg)
                  translate3d(${tilt.x}px, ${tilt.y}px, 50px)
                `
              : 'none',
            transformStyle: 'preserve-3d',
            transition: isMotionActive ? 'none' : 'transform 0.5s ease-out',
          }}
        >
          <img
            src={imageUrl}
            alt={`${shape} diamond - Stock #${stockNumber}`}
            className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl"
            style={{
              filter: isMotionActive ? 'brightness(1.2) contrast(1.1)' : 'none',
              transform: 'translateZ(0)',
            }}
          />
        </div>

        {/* Sparkle Effects */}
        {isMotionActive && (
          <>
            <div 
              className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                transform: `translate(${tilt.x * 2}px, ${tilt.y * 2}px)`,
                boxShadow: '0 0 20px rgba(255,255,255,0.8)',
              }}
            />
            <div 
              className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
              style={{
                transform: `translate(${-tilt.x * 1.5}px, ${-tilt.y * 1.5}px)`,
                animationDelay: '0.5s',
                boxShadow: '0 0 15px rgba(var(--primary),0.6)',
              }}
            />
            <div 
              className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
              style={{
                transform: `translate(${tilt.x}px, ${-tilt.y}px)`,
                animationDelay: '1s',
                boxShadow: '0 0 10px rgba(253,224,71,0.6)',
              }}
            />
          </>
        )}

        {/* Motion Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge 
            variant={isMotionActive ? "default" : "secondary"}
            className="flex items-center gap-2 px-3 py-1.5"
          >
            {isMotionActive ? (
              <>
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span className="text-xs font-medium">Motion Active</span>
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                <span className="text-xs font-medium">Tap to Enable</span>
              </>
            )}
          </Badge>
        </div>

        {/* Device Type Indicator */}
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-black/30 backdrop-blur-sm border-white/20">
            <Smartphone className="h-3 w-3 mr-1" />
            <span className="text-xs">
              {features.hasDeviceOrientation ? '3D' : features.hasGyroscope ? 'Gyro' : 'Accel'}
            </span>
          </Badge>
        </div>

        {/* Rotation Indicators (Debug - Optional) */}
        {isMotionActive && process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 backdrop-blur-sm p-2 rounded space-y-1">
            <div>X: {rotation.x.toFixed(1)}°</div>
            <div>Y: {rotation.y.toFixed(1)}°</div>
            <div>Z: {rotation.z.toFixed(1)}°</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">{shape} Diamond</p>
            <p className="text-xs text-slate-400">Stock #{stockNumber}</p>
          </div>
          
          <Button
            onClick={isMotionActive ? stopMotionTracking : startMotionTracking}
            variant={isMotionActive ? "destructive" : "default"}
            size="sm"
            className="gap-2"
          >
            <RotateCw className={`h-4 w-4 ${isMotionActive ? 'animate-spin' : ''}`} />
            {isMotionActive ? 'Stop' : 'Start'} Motion
          </Button>
        </div>

        {/* Instructions */}
        {isMotionActive && (
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Move your device to rotate the diamond in 3D
          </p>
        )}
      </div>
    </Card>
  );
}
