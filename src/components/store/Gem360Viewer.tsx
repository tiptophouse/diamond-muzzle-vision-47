
import { useState, useEffect, useRef, memo } from 'react';
import { Maximize2, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TiltDiamondController } from '@/components/diamond/TiltDiamondController';

interface Gem360ViewerProps {
  gem360Url: string;
  stockNumber: string;
  isInline?: boolean;
  className?: string;
}

const Gem360Viewer = memo(({ gem360Url, stockNumber, isInline = false, className = "" }: Gem360ViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isTiltMode, setIsTiltMode] = useState(false);
  const [motionSensitivity, setMotionSensitivity] = useState(0.5);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastTouch = useRef({ x: 0, y: 0 });

  // Enhanced URL processing for different 360° formats
  const processedUrl = (() => {
    if (gem360Url.startsWith('http')) return gem360Url;
    if (gem360Url.startsWith('//')) return `https:${gem360Url}`;
    return `https://${gem360Url}`;
  })();

  // Check if it's a static 360° image that needs manual rotation
  const isStaticImage = gem360Url.match(/\.(jpg|jpeg|png)(\?.*)?$/i) && 
    (gem360Url.includes('my360.sela') || gem360Url.includes('DAN'));

  // Handle motion updates from TiltDiamondController
  useEffect(() => {
    const handleMotionUpdate = (event: CustomEvent) => {
      if (!isTiltMode || !isInline) return;
      
      const { beta, gamma } = event.detail;
      const maxRotation = 20;
      const sensitivity = motionSensitivity;
      
      setRotation({
        x: Math.max(-maxRotation, Math.min(maxRotation, beta * sensitivity)),
        y: Math.max(-maxRotation, Math.min(maxRotation, gamma * sensitivity))
      });
    };

    window.addEventListener('motionUpdate', handleMotionUpdate as EventListener);
    return () => {
      window.removeEventListener('motionUpdate', handleMotionUpdate as EventListener);
    };
  }, [isTiltMode, isInline, motionSensitivity]);

  // Touch controls for manual rotation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isStaticImage) return;
    isDragging.current = true;
    const touch = e.touches[0];
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !isStaticImage) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouch.current.x;
    const deltaY = touch.clientY - lastTouch.current.y;
    
    setRotation(prev => ({
      x: Math.max(-30, Math.min(30, prev.x + deltaY * 0.3)),
      y: Math.max(-30, Math.min(30, prev.y + deltaX * 0.3))
    }));
    
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleIframeLoad = () => {
    console.log('✅ 360° VIEWER LOADED for', stockNumber);
    setIsLoading(false);
    setLoadError(false);
  };

  const handleIframeError = () => {
    console.error('❌ 360° VIEWER FAILED for', stockNumber, ':', processedUrl);
    setIsLoading(false);
    setLoadError(true);
  };

  // Auto-hide loading after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ 360° VIEWER TIMEOUT for', stockNumber);
        setIsLoading(false);
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [isLoading, stockNumber]);

  const toggleFullscreen = () => {
    setIsFullscreen(true);
  };

  const resetView = () => {
    if (isStaticImage) {
      setRotation({ x: 0, y: 0 });
    } else if (iframeRef.current) {
      iframeRef.current.src = processedUrl;
    }
  };

  // Error fallback
  if (loadError && !isStaticImage) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <RotateCcw className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-600">360° View Unavailable</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setLoadError(false);
              setIsLoading(true);
              if (iframeRef.current) {
                iframeRef.current.src = processedUrl;
              }
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
      <TiltDiamondController
        className={`relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden ${className}`}
        onModeChange={setIsTiltMode}
        sensitivity={motionSensitivity}
        onSensitivityChange={setMotionSensitivity}
      >
        <div 
          ref={containerRef}
          className="w-full h-full"
          onTouchStart={!isTiltMode ? handleTouchStart : undefined}
          onTouchMove={!isTiltMode ? handleTouchMove : undefined}
          onTouchEnd={!isTiltMode ? handleTouchEnd : undefined}
        >
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading 360° View...</p>
            </div>
          </div>
        )}
        
          {/* Static 360° image with manual controls */}
          {isStaticImage ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={processedUrl}
                alt={`360° View of Diamond ${stockNumber}`}
                className={`w-full h-full object-contain transition-all duration-200 ${
                  isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
                style={{
                  transform: isTiltMode ? '' : `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center'
                }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                loading="eager"
              />
            </div>
          ) : (
            /* Interactive iframe viewer */
            <iframe
              ref={iframeRef}
              src={processedUrl}
              className={`w-full h-full border-0 transition-opacity duration-500 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="accelerometer; gyroscope; vr; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer-when-downgrade"
              title={`360° View of Diamond ${stockNumber}`}
            />
          )}

          {/* Enhanced Controls overlay */}
          {isInline && !isTiltMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                <div className="flex gap-2">
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
                  360° Interactive • {isStaticImage ? 'Touch & Tilt' : 'Embedded'}
                </div>
              </div>
            </div>
          )}
        </div>
      </TiltDiamondController>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">
              360° Interactive View - Diamond {stockNumber}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden relative">
            {isStaticImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={processedUrl}
                  alt={`360° Fullscreen View of Diamond ${stockNumber}`}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                />
              </div>
            ) : (
              <iframe
                src={processedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; gyroscope; vr; xr-spatial-tracking"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                referrerPolicy="no-referrer-when-downgrade"
                title={`360° Fullscreen View of Diamond ${stockNumber}`}
              />
            )}
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
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

Gem360Viewer.displayName = 'Gem360Viewer';

export { Gem360Viewer };
