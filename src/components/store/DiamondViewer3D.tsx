
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, RotateCcw } from 'lucide-react';

interface DiamondViewer3DProps {
  imageUrl?: string;
  stockNumber: string;
  totalFrames?: number;
  className?: string;
}

export function DiamondViewer3D({ 
  imageUrl, 
  stockNumber, 
  totalFrames = 60,
  className = ""
}: DiamondViewer3DProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMotionEnabled, setIsMotionEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [motionPermission, setMotionPermission] = useState<boolean | null>(null);
  
  const rafId = useRef<number>();
  const lastTouch = useRef({ x: 0, y: 0 });
  
  // Request iOS motion permission
  const requestMotionPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        const granted = permission === 'granted';
        setMotionPermission(granted);
        return granted;
      } catch (error) {
        console.error('Motion permission error:', error);
        setMotionPermission(false);
        return false;
      }
    }
    // Android/desktop - assume permission granted
    setMotionPermission(true);
    return true;
  };
  
  // Handle device orientation with RAF throttling
  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (!isMotionEnabled) return;
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    rafId.current = requestAnimationFrame(() => {
      const gamma = event.gamma || 0; // left/right tilt (-90 to 90)
      
      // Map gamma to frame index
      const normalizedGamma = Math.max(-90, Math.min(90, gamma));
      const frameIndex = Math.floor(((normalizedGamma + 90) / 180) * (totalFrames - 1));
      
      setCurrentFrame(frameIndex);
    });
  };
  
  // Touch/drag fallback
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouch.current.x;
    
    // Map horizontal drag to frame change
    const sensitivity = 2;
    const frameChange = Math.floor(deltaX / sensitivity);
    
    if (Math.abs(frameChange) > 0) {
      setCurrentFrame(prev => {
        const newFrame = (prev + frameChange) % totalFrames;
        return newFrame < 0 ? totalFrames + newFrame : newFrame;
      });
      
      lastTouch.current = { x: touch.clientX, y: touch.clientY };
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Toggle motion control
  const toggleMotion = async () => {
    if (!isMotionEnabled) {
      const hasPermission = motionPermission ?? await requestMotionPermission();
      if (hasPermission) {
        setIsMotionEnabled(true);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      setIsMotionEnabled(false);
      window.removeEventListener('deviceorientation', handleOrientation);
    }
  };
  
  // Reset view
  const resetView = () => {
    setCurrentFrame(0);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);
  
  const frameImageUrl = imageUrl ? 
    `${imageUrl}?frame=${currentFrame}` : 
    `/api/diamonds/${stockNumber}/frame/${currentFrame}`;
  
  return (
    <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* 3D Viewer */}
      <div 
        className="aspect-square w-full relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={frameImageUrl}
          alt={`Diamond ${stockNumber} - Frame ${currentFrame}`}
          className="w-full h-full object-contain transition-opacity duration-100"
          draggable={false}
        />
        
        {/* Frame indicator */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {currentFrame + 1}/{totalFrames}
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-3 bg-white/90 border-t flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isMotionEnabled ? "default" : "outline"}
            onClick={toggleMotion}
            disabled={motionPermission === false}
            className="h-8"
          >
            <Smartphone className="h-3 w-3 mr-1" />
            {isMotionEnabled ? 'Motion ON' : 'Enable Motion'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={resetView}
            className="h-8"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="text-xs text-gray-600">
          {isMotionEnabled ? 'Tilt to rotate' : 'Drag to rotate'}
        </div>
      </div>
    </div>
  );
}
