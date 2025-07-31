import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, RotateCcw, Eye, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ThreeDViewerProps {
  imageUrl: string;
  stockNumber: string;
  onClose?: () => void;
}

export function ThreeDViewer({ imageUrl, stockNumber, onClose }: ThreeDViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if the image URL suggests it's a 3D/360 image
  const is3DImage = imageUrl.includes('360') || imageUrl.includes('3d') || imageUrl.includes('rotate');

  useEffect(() => {
    if (is3DImage) {
      // Auto-rotate for 3D images
      const interval = setInterval(() => {
        setRotation(prev => (prev + 1) % 360);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [is3DImage]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const resetRotation = () => {
    setRotation(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(true);
  };

  if (!is3DImage) {
    // Regular image display
    return (
      <div className="relative group overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={`Diamond ${stockNumber}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          onLoad={handleImageLoad}
        />
        
        {/* Improved hover overlay - positioned at bottom instead of covering entire image */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-3">
          <div className="flex justify-center">
            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="outline"
              className="bg-white/95 hover:bg-white border-white/20 backdrop-blur-sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3D/360 image display
  return (
    <>
      <div className="relative group bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden">
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ transform: `rotateY(${rotation}deg)`, transformStyle: 'preserve-3d' }}
        >
          <img
            src={imageUrl}
            alt={`Diamond ${stockNumber} - 360° View`}
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
          />
        </div>
        
        {/* 3D Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                onClick={resetRotation}
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={toggleFullscreen}
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
              360° View
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center justify-between">
              <span>Diamond {stockNumber} - 360° View</span>
              <Button
                onClick={() => setIsFullscreen(false)}
                size="sm"
                variant="outline"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden">
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ transform: `rotateY(${rotation}deg)`, transformStyle: 'preserve-3d' }}
            >
              <img
                src={imageUrl}
                alt={`Diamond ${stockNumber} - 360° View`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={resetRotation} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}