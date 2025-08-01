
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Eye, RotateCcw } from "lucide-react";
import { useTelegramAccelerometer } from "@/hooks/useTelegramAccelerometer";

interface Gem360ViewerProps {
  gem360Url: string;
  stockNumber: string;
  isInline?: boolean;
}

export function Gem360Viewer({ gem360Url, stockNumber, isInline = false }: Gem360ViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMotionEnabled, setIsMotionEnabled] = useState(false);
  const { accelerometerData, orientationData, isSupported, startAccelerometer, stopAccelerometer } = useTelegramAccelerometer(isMotionEnabled, 60);

  // Clean and validate the 360° URL
  const getViewerUrl = (url: string) => {
    console.log('🔍 Gem360Viewer - Processing URL:', url);
    
    // Handle vision360.html format
    if (url.includes('vision360.html')) {
      // Ensure it starts with https://
      if (!url.startsWith('http')) {
        return `https://${url}`;
      }
      return url;
    }
    
    // Handle gem360 format
    if (url.includes('view.gem360.in') || url.includes('gem360.in')) {
      if (!url.startsWith('http')) {
        return `https://${url}`;
      }
      return url;
    }
    
    // Handle my360.sela format - convert to iframe-friendly URL
    if (url.includes('my360.sela')) {
      if (!url.startsWith('http')) {
        return `https://${url}`;
      }
      return url;
    }
    
    // If it's some other format, try to extract the relevant part
    const gem360Match = url.match(/gem360[^"'\s]*/);
    if (gem360Match) {
      return `https://view.gem360.in/${gem360Match[0]}`;
    }
    
    return url;
  };

  const viewerUrl = getViewerUrl(gem360Url);
  
  console.log('🔍 Gem360Viewer - URL Processing:', {
    original: gem360Url,
    processed: viewerUrl,
    stockNumber,
    isVision360: gem360Url.includes('vision360.html'),
    isMy360Sela: gem360Url.includes('my360.sela')
  });

  // Toggle motion control for supported devices
  const toggleMotionControl = () => {
    if (!isSupported) return;
    
    const newState = !isMotionEnabled;
    setIsMotionEnabled(newState);
    
    if (newState) {
      startAccelerometer();
    } else {
      stopAccelerometer();
    }
  };

  // Apply motion-based rotation to iframe (if supported)
  const getMotionStyles = () => {
    if (!isMotionEnabled || !isSupported) return {};
    
    const { beta, gamma } = orientationData;
    
    // Convert orientation to subtle rotation (max ±5° for smooth viewing)
    const rotateX = Math.max(-5, Math.min(5, beta * 0.3));
    const rotateY = Math.max(-5, Math.min(5, gamma * 0.3));
    
    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: isMotionEnabled ? 'none' : 'transform 0.3s ease'
    };
  };

  const handleIframeLoad = () => {
    console.log('✅ Gem360Viewer - 360° viewer loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    console.error('❌ Gem360Viewer - 360° viewer failed to load:', viewerUrl);
    setIsLoading(false);
    setHasError(true);
  };

  // Cleanup accelerometer on unmount
  useEffect(() => {
    return () => {
      if (isMotionEnabled) {
        stopAccelerometer();
      }
    };
  }, [isMotionEnabled, stopAccelerometer]);

  if (isInline) {
    return (
      <div className="relative w-full h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden">
        {/* 360° Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 font-semibold">
            ✨ 360° VIEW
          </Badge>
        </div>
        
        {/* Motion Control Toggle (if supported) */}
        {isSupported && (
          <div className="absolute top-2 right-12 z-10">
            <Button
              size="sm"
              variant={isMotionEnabled ? "default" : "outline"}
              onClick={toggleMotionControl}
              className={`h-8 w-8 p-0 rounded-full ${
                isMotionEnabled 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-white/90 backdrop-blur-sm text-slate-600'
              }`}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Loading overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 z-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 absolute top-0 left-0"></div>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">Loading 360° viewer...</p>
              <p className="text-xs text-slate-500">#{stockNumber}</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 z-20">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">360° viewer unavailable</p>
              <p className="text-xs text-slate-500">#{stockNumber}</p>
            </div>
          </div>
        )}
        
        {/* 360° Iframe Viewer */}
        {!hasError && (
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0 rounded-lg"
            title={`360° Diamond Viewer - ${stockNumber}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="accelerometer; gyroscope; fullscreen; autoplay"
            style={{
              display: isLoading ? 'none' : 'block',
              ...getMotionStyles()
            }}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )}
        
        {/* Expand to fullscreen button */}
        {!hasError && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              >
                <Maximize2 className="h-4 w-4 text-slate-700" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-full h-[85vh] p-0">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle className="flex items-center gap-3">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    360°
                  </Badge>
                  Diamond #{stockNumber}
                  {isSupported && (
                    <Button
                      size="sm"
                      variant={isMotionEnabled ? "default" : "outline"}
                      onClick={toggleMotionControl}
                      className="ml-auto"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {isMotionEnabled ? 'Motion On' : 'Motion Off'}
                    </Button>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-full p-4">
                <iframe
                  src={viewerUrl}
                  className="w-full h-full border-0 rounded-lg shadow-inner"
                  title={`360° Diamond Viewer - ${stockNumber}`}
                  allow="accelerometer; gyroscope; fullscreen; autoplay"
                  style={getMotionStyles()}
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Modal-only version (fallback)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-purple-600 shadow-lg"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-full h-[85vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              360°
            </Badge>
            Diamond #{stockNumber}
            {isSupported && (
              <Button
                size="sm"
                variant={isMotionEnabled ? "default" : "outline"}
                onClick={toggleMotionControl}
                className="ml-auto"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {isMotionEnabled ? 'Motion On' : 'Motion Off'}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full p-4">
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0 rounded-lg shadow-inner"
            title={`360° Diamond Viewer - ${stockNumber}`}
            allow="accelerometer; gyroscope; fullscreen; autoplay"
            style={getMotionStyles()}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
