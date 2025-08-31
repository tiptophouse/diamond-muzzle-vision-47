
import { useState, useEffect, useRef, memo } from 'react';
import { Maximize2, RotateCcw, Loader2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTelegramAccelerometer } from '@/hooks/useTelegramAccelerometer';

interface Enhanced3DViewerProps {
  imageUrl: string;
  stockNumber: string;
  isInline?: boolean;
  className?: string;
}

const Enhanced3DViewer = memo(({ imageUrl, stockNumber, isInline = false, className = "" }: Enhanced3DViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const { accelerometerData, orientationData, isSupported } = useTelegramAccelerometer(isInline);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastTouch = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Auto-rotation effect
  useEffect(() => {
    if (isAutoRotating && !isDragging.current) {
      const animate = () => {
        setRotation(prev => ({
          x: prev.x,
          y: (prev.y + 0.5) % 360
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoRotating]);

  // Handle device motion for tilt control
  useEffect(() => {
    if (isSupported && orientationData && isInline && !isAutoRotating) {
      const { beta, gamma } = orientationData;
      setRotation({
        x: Math.max(-30, Math.min(30, beta * 0.5)),
        y: Math.max(-30, Math.min(30, gamma * 0.5))
      });
    }
  }, [orientationData, isSupported, isInline, isAutoRotating]);

  // Touch controls for manual rotation
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    setIsAutoRotating(false);
    const touch = e.touches[0];
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouch.current.x;
    const deltaY = touch.clientY - lastTouch.current.y;
    
    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
      y: (prev.y + deltaX * 0.5) % 360
    }));
    
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleImageLoad = () => {
    console.log('✅ 3D VIEWER LOADED for', stockNumber);
    setIsLoading(false);
    setLoadError(false);
  };

  const handleImageError = () => {
    console.error('❌ 3D VIEWER FAILED for', stockNumber, ':', imageUrl);
    setIsLoading(false);
    setLoadError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(true);
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setIsAutoRotating(true);
  };

  const toggleAutoRotation = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  // Error fallback
  if (loadError) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <RotateCcw className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-600">3D View Unavailable</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setLoadError(false);
              setIsLoading(true);
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={containerRef}
        className={`relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading 3D View...</p>
            </div>
          </div>
        )}
        
        {/* 3D Diamond Image with rotation */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <div
            className="relative transform-gpu transition-transform duration-100 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            <img
              src={imageUrl}
              alt={`3D View of Diamond ${stockNumber}`}
              className={`max-w-full max-h-full object-contain drop-shadow-2xl transition-opacity duration-500 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
              }}
            />
            
            {/* Reflection effect */}
            <div 
              className="absolute inset-0 opacity-20 transform scale-y-[-1] translate-y-full"
              style={{
                background: `linear-gradient(to bottom, 
                  rgba(255, 255, 255, 0.1) 0%, 
                  transparent 50%)`
              }}
            />
          </div>
        </div>

        {/* Controls overlay */}
        {isInline && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  onClick={toggleAutoRotation}
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 bg-white/90 hover:bg-white border-0 text-gray-900"
                >
                  {isAutoRotating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button
                  onClick={resetView}
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 bg-white/90 hover:bg-white border-0 text-gray-900"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 bg-white/90 hover:bg-white border-0 text-gray-900"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                3D Interactive • Touch & Tilt
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">
              3D Interactive View - Diamond {stockNumber}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center p-8">
              <div
                className="relative transform-gpu transition-transform duration-100 ease-out"
                style={{
                  transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <img
                  src={imageUrl}
                  alt={`3D Fullscreen View of Diamond ${stockNumber}`}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))',
                  }}
                />
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
              <Button 
                onClick={toggleAutoRotation} 
                variant="outline"
                className="bg-white/90 hover:bg-white border-0 text-gray-900"
              >
                {isAutoRotating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isAutoRotating ? 'Pause' : 'Auto Rotate'}
              </Button>
              <Button 
                onClick={resetView} 
                variant="outline"
                className="bg-white/90 hover:bg-white border-0 text-gray-900"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

Enhanced3DViewer.displayName = 'Enhanced3DViewer';

export { Enhanced3DViewer };
