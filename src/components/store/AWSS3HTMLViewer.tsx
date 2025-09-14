import { useState, useEffect, useRef } from 'react';
import { Maximize2, RotateCcw, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface AWSS3HTMLViewerProps {
  htmlUrl: string;
  stockNumber: string;
  isInline?: boolean;
  className?: string;
}

export function AWSS3HTMLViewer({ 
  htmlUrl, 
  stockNumber, 
  isInline = false,
  className = "" 
}: AWSS3HTMLViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Process AWS S3 HTML URL for optimal embedding
  const processedUrl = (() => {
    let url = htmlUrl.trim();
    
    // Ensure HTTPS protocol
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    } else if (!url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // For AWS S3 HTML files, ensure proper CORS and caching
    if (url.includes('my360.fab') || url.includes('s3.') && url.endsWith('.html')) {
      // Add cache busting and ensure proper headers
      const urlObj = new URL(url);
      urlObj.searchParams.set('t', Date.now().toString());
      url = urlObj.toString();
    }

    return url;
  })();

  // Determine the viewer type based on URL
  const viewerType = htmlUrl.includes('my360.fab') ? 'my360.fab' : 'AWS S3 HTML';

  // Auto-hide loading after timeout with retry logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && retryCount < 2) {
        console.warn(`⚠️ AWS S3 HTML VIEWER TIMEOUT for ${stockNumber}, attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        // Retry by reloading the iframe
        if (iframeRef.current) {
          iframeRef.current.src = processedUrl;
        }
      } else if (isLoading) {
        console.error(`❌ AWS S3 HTML VIEWER FINAL TIMEOUT for ${stockNumber}`);
        setIsLoading(false);
        setLoadError(true);
      }
    }, 10000); // Longer timeout for HTML files

    return () => clearTimeout(timeout);
  }, [isLoading, stockNumber, retryCount, processedUrl]);

  const handleIframeLoad = () => {
    console.log('✅ AWS S3 HTML VIEWER LOADED for', stockNumber);
    setIsLoading(false);
    setLoadError(false);
    setRetryCount(0);
  };

  const handleIframeError = () => {
    console.error('❌ AWS S3 HTML VIEWER FAILED for', stockNumber, ':', processedUrl);
    setIsLoading(false);
    setLoadError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(true);
  };

  const resetView = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setLoadError(false);
      setRetryCount(0);
      iframeRef.current.src = processedUrl;
    }
  };

  const openInNewTab = () => {
    window.open(htmlUrl, '_blank', 'noopener,noreferrer');
  };

  // Error fallback with retry option
  if (loadError) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-br from-orange-50 to-red-50 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-sm text-gray-700 font-medium mb-1">360° HTML Viewer Unavailable</p>
          <p className="text-xs text-gray-500 mb-3">Failed to load interactive HTML viewer</p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetView}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={openInNewTab}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Direct
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative w-full h-full bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg overflow-hidden ${className}`}>
        {/* Loading state with enhanced visual feedback */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-gradient-to-br from-white to-orange-50">
            <div className="text-center text-gray-700">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-orange-600" />
              <p className="text-sm font-medium">Loading 360° HTML Viewer</p>
              <p className="text-xs text-gray-500 mt-1">
                {retryCount > 0 ? `Retry attempt ${retryCount}/2` : 'Please wait...'}
              </p>
              <div className="mt-3 w-24 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-orange-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* AWS S3 HTML iframe with optimizations */}
        <iframe
          ref={iframeRef}
          src={processedUrl}
          className={`w-full h-full border-0 transition-opacity duration-500 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; fullscreen; vr; xr-spatial-tracking"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation-by-user-activation"
          referrerPolicy="no-referrer-when-downgrade"
          title={`360° HTML Interactive View of Diamond ${stockNumber}`}
          style={{
            colorScheme: 'light',
            background: 'transparent'
          }}
        />

        {/* Enhanced controls overlay for inline view */}
        {isInline && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-auto">
              <div className="flex gap-2">
                <Button
                  onClick={resetView}
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 bg-white/95 hover:bg-white border-0 text-gray-900 shadow-sm"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 bg-white/95 hover:bg-white border-0 text-gray-900 shadow-sm"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  onClick={openInNewTab}
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 bg-white/95 hover:bg-white border-0 text-gray-900 shadow-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <Badge className="bg-black/80 text-white border-0 px-2 py-1 text-xs font-medium">
                360° HTML • {viewerType}
              </Badge>
            </div>
          </div>
        )}

        {/* Loading progress indicator */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-30">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Enhanced Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl w-[98vw] h-[95vh] p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base flex items-center justify-between">
              <span>360° HTML Interactive View - Diamond {stockNumber}</span>
              <div className="flex gap-2">
                <Button
                  onClick={openInNewTab}
                  size="sm"
                  variant="outline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open Direct
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg overflow-hidden relative">
            <iframe
              src={processedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; fullscreen; vr; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation-by-user-activation"
              referrerPolicy="no-referrer-when-downgrade"
              title={`360° HTML Fullscreen View of Diamond ${stockNumber}`}
            />
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
              <Button 
                onClick={resetView} 
                variant="outline"
                className="bg-white/95 hover:bg-white border-0 text-gray-900 shadow-lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <Button 
                onClick={openInNewTab} 
                variant="outline"
                className="bg-white/95 hover:bg-white border-0 text-gray-900 shadow-lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}