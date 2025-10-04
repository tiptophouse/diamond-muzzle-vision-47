/**
 * Motion-Enhanced 360° Diamond Viewer
 * Uses Telegram SDK accelerometer/gyroscope for natural device-tilt control
 * Simulates holding and inspecting a real diamond
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTelegramAdvanced } from '@/hooks/useTelegramAdvanced';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, RotateCw, Sparkles, Hand, Smartphone, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MotionEnhanced360ViewerProps {
  imageUrl: string;
  stockNumber: string;
  shape: string;
  carat: number;
  isInline?: boolean;
  className?: string;
}

export function MotionEnhanced360Viewer({
  imageUrl,
  stockNumber,
  shape,
  carat,
  isInline = false,
  className = ""
}: MotionEnhanced360ViewerProps) {
  const { deviceOrientation, gyroscope, features, isInitialized } = useTelegramAdvanced();
  const { haptic } = useTelegramSDK();
  
  const [isMotionActive, setIsMotionActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const imageRef = useRef<HTMLDivElement>(null);
  const baseRotationRef = useRef({ x: 0, y: 0, z: 0 });

  const hasMotionSupport = features.hasDeviceOrientation || features.hasGyroscope;

  // Generate sparkle effects based on rotation
  useEffect(() => {
    if (isMotionActive && Math.abs(rotation.y) > 5) {
      const newSparkles = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.2
      }));
      setSparkles(newSparkles);
      
      const timer = setTimeout(() => setSparkles([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [rotation.y, isMotionActive]);

  const startMotionControl = useCallback(() => {
    if (!isInitialized || !hasMotionSupport) return;

    haptic?.impact?.('medium');

    // Device Orientation gives absolute angles
    if (features.hasDeviceOrientation) {
      const started = deviceOrientation.start((data) => {
        // Convert to intuitive diamond rotation
        const rotX = (data.beta || 0) - 90; // Tilt forward/back
        const rotY = (data.gamma || 0);      // Tilt left/right
        const rotZ = (data.alpha || 0) * 0.1; // Slight compass rotation
        
        setRotation({ 
          x: Math.max(-45, Math.min(45, rotX)), 
          y: Math.max(-45, Math.min(45, rotY)), 
          z: rotZ 
        });
        
        // Calculate parallax tilt
        setTilt({
          x: Math.max(-30, Math.min(30, rotY / 3)),
          y: Math.max(-30, Math.min(30, rotX / 3))
        });
      }, false, 60);

      if (started) {
        setIsMotionActive(true);
        console.log('✅ Motion-enhanced 360° viewing started');
        return;
      }
    }

    // Fallback to gyroscope (accumulate rotation)
    if (features.hasGyroscope) {
      const started = gyroscope.start((data) => {
        baseRotationRef.current = {
          x: baseRotationRef.current.x + data.x * 0.5,
          y: baseRotationRef.current.y + data.y * 0.5,
          z: baseRotationRef.current.z + data.z * 0.1,
        };

        setRotation({
          x: Math.max(-45, Math.min(45, baseRotationRef.current.x)),
          y: Math.max(-45, Math.min(45, baseRotationRef.current.y)),
          z: baseRotationRef.current.z
        });

        setTilt({
          x: Math.max(-30, Math.min(30, baseRotationRef.current.y)),
          y: Math.max(-30, Math.min(30, baseRotationRef.current.x))
        });
      }, 60);

      if (started) {
        setIsMotionActive(true);
        console.log('✅ Gyroscope diamond control started');
      }
    }
  }, [isInitialized, hasMotionSupport, features, deviceOrientation, gyroscope, haptic]);

  const stopMotionControl = useCallback(() => {
    haptic?.impact?.('light');
    
    deviceOrientation.stop();
    gyroscope.stop();
    
    setIsMotionActive(false);
    setRotation({ x: 0, y: 0, z: 0 });
    setTilt({ x: 0, y: 0 });
    baseRotationRef.current = { x: 0, y: 0, z: 0 };
    setSparkles([]);
    
    console.log('🛑 Motion control stopped');
  }, [deviceOrientation, gyroscope, haptic]);

  const resetView = useCallback(() => {
    haptic?.impact?.('medium');
    baseRotationRef.current = { x: 0, y: 0, z: 0 };
    setRotation({ x: 0, y: 0, z: 0 });
    setTilt({ x: 0, y: 0 });
  }, [haptic]);

  useEffect(() => {
    return () => {
      if (isMotionActive) {
        stopMotionControl();
      }
    };
  }, [isMotionActive, stopMotionControl]);

  // Render fallback for no motion support
  if (!hasMotionSupport) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <img 
          src={imageUrl} 
          alt={`${shape} diamond - ${stockNumber}`}
          className="w-full h-auto rounded-lg mb-4"
        />
        <Badge variant="secondary" className="gap-2">
          <Smartphone className="h-3 w-3" />
          Motion sensors not available
        </Badge>
      </Card>
    );
  }

  const diamondContent = (
    <div className="relative h-full w-full perspective-1000">
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-3xl transition-transform duration-100"
        style={{
          transform: `translate(${tilt.x * 1.5}px, ${tilt.y * 1.5}px) scale(${isMotionActive ? 1.2 : 1})`,
        }}
      />

      {/* Main Diamond Container */}
      <div
        ref={imageRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: isMotionActive 
            ? `
                perspective(1200px)
                rotateX(${rotation.x * 0.8}deg) 
                rotateY(${rotation.y * 0.8}deg) 
                rotateZ(${rotation.z * 0.3}deg)
                translate3d(${tilt.x * 0.5}px, ${tilt.y * 0.5}px, 80px)
                scale(${1 + Math.abs(rotation.y) * 0.002})
              `
            : 'perspective(1200px) rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
          transition: isMotionActive ? 'none' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="relative">
          {/* Diamond Image */}
          <img
            src={imageUrl}
            alt={`${carat}ct ${shape} diamond - Stock #${stockNumber}`}
            className="max-w-[85%] max-h-[85%] object-contain drop-shadow-2xl mx-auto"
            style={{
              filter: isMotionActive 
                ? `brightness(${1.1 + Math.abs(rotation.y) * 0.003}) contrast(1.15) saturate(1.1)` 
                : 'brightness(1) contrast(1)',
              transform: 'translateZ(50px)',
            }}
          />

          {/* Dynamic Light Reflections */}
          {isMotionActive && (
            <>
              <div 
                className="absolute top-1/4 left-1/4 w-16 h-16 bg-white rounded-full blur-xl opacity-40 animate-pulse"
                style={{
                  transform: `translate(${rotation.y * 2}px, ${rotation.x * 2}px)`,
                  mixBlendMode: 'screen',
                }}
              />
              <div 
                className="absolute bottom-1/3 right-1/3 w-12 h-12 bg-blue-300 rounded-full blur-lg opacity-30 animate-pulse"
                style={{
                  transform: `translate(${-rotation.y * 1.5}px, ${-rotation.x * 1.5}px)`,
                  animationDelay: '0.3s',
                  mixBlendMode: 'screen',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Sparkle Effects */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute w-2 h-2 bg-white rounded-full animate-ping"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
            boxShadow: '0 0 20px rgba(255,255,255,0.8)',
          }}
        />
      ))}

      {/* Status Badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge 
          variant={isMotionActive ? "default" : "secondary"}
          className="flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm"
        >
          {isMotionActive ? (
            <>
              <Hand className="h-3 w-3 animate-pulse" />
              <span className="text-xs font-medium">Tilt to Rotate</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              <span className="text-xs font-medium">Motion View</span>
            </>
          )}
        </Badge>
      </div>

      {/* Sensor Type Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="outline" className="bg-black/30 backdrop-blur-sm border-white/20">
          <Smartphone className="h-3 w-3 mr-1" />
          <span className="text-xs">
            {features.hasDeviceOrientation ? '3D Gyro' : 'Motion'}
          </span>
        </Badge>
      </div>

      {/* Rotation Debug Info (dev only) */}
      {isMotionActive && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 text-white text-xs bg-black/60 backdrop-blur-sm p-2 rounded space-y-1">
          <div>X: {rotation.x.toFixed(1)}°</div>
          <div>Y: {rotation.y.toFixed(1)}°</div>
          <div>Z: {rotation.z.toFixed(1)}°</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Inline Viewer */}
      <Card className={`overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
        <div className="relative h-96">
          {diamondContent}
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-medium">{carat}ct {shape}</p>
              <p className="text-xs text-slate-400">Stock #{stockNumber}</p>
            </div>
            
            <div className="flex gap-2">
              {isMotionActive && (
                <Button
                  onClick={resetView}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Reset
                </Button>
              )}
              
              <Button
                onClick={isMotionActive ? stopMotionControl : startMotionControl}
                variant={isMotionActive ? "destructive" : "default"}
                size="sm"
                className="gap-2"
              >
                <Hand className={`h-4 w-4 ${isMotionActive ? 'animate-pulse' : ''}`} />
                {isMotionActive ? 'Stop' : 'Start'}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          {isMotionActive ? (
            <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-800/50 p-3 rounded">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Tilt your device to inspect the diamond:</p>
                <ul className="space-y-0.5 text-slate-400">
                  <li>• Tilt left/right to rotate horizontally</li>
                  <li>• Tilt forward/back to view from different angles</li>
                  <li>• Watch how light reflects off the facets</li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Experience immersive 3D diamond viewing with device motion
            </p>
          )}
        </div>

        {/* Fullscreen Button */}
        {isInline && (
          <div className="px-4 pb-4">
            <Button
              onClick={() => setIsFullscreen(true)}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Fullscreen View
            </Button>
          </div>
        )}
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">
              Motion-Enhanced 360° View - {carat}ct {shape} Diamond
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 relative">
            <Card className="h-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              {diamondContent}
              
              {/* Fullscreen Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 z-20">
                {isMotionActive && (
                  <Button 
                    onClick={resetView} 
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Reset View
                  </Button>
                )}
                
                <Button
                  onClick={isMotionActive ? stopMotionControl : startMotionControl}
                  variant={isMotionActive ? "destructive" : "default"}
                  className="gap-2"
                >
                  <Hand className={`h-4 w-4 ${isMotionActive ? 'animate-pulse' : ''}`} />
                  {isMotionActive ? 'Stop Motion' : 'Start Motion'}
                </Button>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
