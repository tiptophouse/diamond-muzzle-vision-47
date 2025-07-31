
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Eye, RotateCcw } from "lucide-react";

interface V360ViewerProps {
  v360Url: string;
  stockNumber: string;
  isInline?: boolean;
}

export function V360Viewer({ v360Url, stockNumber, isInline = false }: V360ViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Extract v360.in parameters and construct proper embed URL
  const getV360EmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const cid = urlObj.searchParams.get('cid');
      const d = urlObj.searchParams.get('d');
      
      if (cid && d) {
        // Construct the embedded viewer URL
        return `https://v360.in/diamondview.aspx?cid=${cid}&d=${d}&embed=1&controls=1`;
      }
      
      // If it's already an embed URL or different format, use as is
      return url.includes('embed=1') ? url : `${url}&embed=1&controls=1`;
    } catch (error) {
      console.error('Error parsing V360 URL:', error);
      return url;
    }
  };

  const embedUrl = getV360EmbedUrl(v360Url);
  
  console.log('🔍 V360Viewer - Original URL:', v360Url);
  console.log('🔍 V360Viewer - Embed URL:', embedUrl);

  const handleIframeLoad = () => {
    console.log('✅ V360Viewer - Iframe loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    console.error('❌ V360Viewer - Iframe failed to load:', embedUrl);
    setIsLoading(false);
    setHasError(true);
  };

  if (isInline) {
    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        {/* 360° Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs px-2 py-1">
            360° DIAMOND VIEW
          </Badge>
        </div>
        
        {/* Loading overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading 360° viewer...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-500">360° viewer unavailable</p>
              <p className="text-xs text-gray-400 mt-1">#{stockNumber}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open(v360Url, '_blank')}
              >
                Open in New Tab
              </Button>
            </div>
          </div>
        )}
        
        {/* Iframe for 360° viewer */}
        {!hasError && (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            title={`360° Diamond Viewer - ${stockNumber}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="accelerometer; gyroscope; fullscreen; autoplay"
            allowFullScreen
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
        
        {/* Expand button - only show if viewer loaded successfully */}
        {!hasError && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full h-[80vh]">
              <DialogHeader>
                <DialogTitle>360° Diamond Viewer - #{stockNumber}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-full">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title={`360° Diamond Viewer - ${stockNumber}`}
                  allow="accelerometer; gyroscope; fullscreen; autoplay"
                  allowFullScreen
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Modal version
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-blue-600"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle>360° Diamond Viewer - #{stockNumber}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0 rounded-lg"
            title={`360° Diamond Viewer - ${stockNumber}`}
            allow="accelerometer; gyroscope; fullscreen; autoplay"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
