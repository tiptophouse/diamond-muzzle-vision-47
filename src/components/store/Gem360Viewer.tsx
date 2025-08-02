
import { useState, useEffect, useRef, memo } from 'react';
import { Maximize2, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ENHANCED: Better URL validation and processing
  const processedUrl = gem360Url.startsWith('http') ? gem360Url : `https://${gem360Url}`;

  // Handle iframe loading
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
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, stockNumber]);

  const toggleFullscreen = () => {
    setIsFullscreen(true);
  };

  const resetView = () => {
    if (iframeRef.current) {
      // Reload iframe to reset 360° view
      iframeRef.current.src = processedUrl;
    }
  };

  // ENHANCED: Better error fallback
  if (loadError) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-700 ${className}`}>
        <div className="text-center text-white p-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <RotateCcw className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-sm">360° View Unavailable</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
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
      <div className={`relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden ${className}`}>
        {/* IMPROVED: Loading state with spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-gradient-to-br from-gray-900 to-gray-700">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading 360° View...</p>
            </div>
          </div>
        )}
        
        {/* ENHANCED: 360° iframe with better attributes */}
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

        {/* ENHANCED: Controls overlay for inline view */}
        {isInline && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                360° Interactive
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ENHANCED: Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">
              360° Interactive View - Diamond {stockNumber}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden relative">
            <iframe
              src={processedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; gyroscope; vr; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer-when-downgrade"
              title={`360° Fullscreen View of Diamond ${stockNumber}`}
            />
            
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
