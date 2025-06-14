
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Eye } from "lucide-react";

interface Gem360ViewerProps {
  gem360Url: string;
  stockNumber: string;
  isInline?: boolean;
}

export function Gem360Viewer({ gem360Url, stockNumber, isInline = false }: Gem360ViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Clean and validate the Gem360 URL
  const getViewerUrl = (url: string) => {
    // If it's already a direct gem360 URL, use it as is
    if (url.includes('view.gem360.in') || url.includes('gem360.in')) {
      // Ensure it starts with https://
      if (!url.startsWith('http')) {
        return `https://${url}`;
      }
      return url;
    }
    
    // If it's some other format, try to extract the gem360 part
    const gem360Match = url.match(/gem360[^"'\s]*/);
    if (gem360Match) {
      return `https://view.gem360.in/${gem360Match[0]}`;
    }
    
    return url;
  };

  const viewerUrl = getViewerUrl(gem360Url);
  
  console.log('🔍 Gem360Viewer - Original URL:', gem360Url);
  console.log('🔍 Gem360Viewer - Processed URL:', viewerUrl);

  const handleIframeLoad = () => {
    console.log('✅ Gem360Viewer - Iframe loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    console.error('❌ Gem360Viewer - Iframe failed to load:', viewerUrl);
    setIsLoading(false);
    setHasError(true);
  };

  if (isInline) {
    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        {/* 3D Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1">
            3D VIEW
          </Badge>
        </div>
        
        {/* Loading overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading 3D viewer...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-500">3D viewer unavailable</p>
              <p className="text-xs text-gray-400 mt-1">#{stockNumber}</p>
            </div>
          </div>
        )}
        
        {/* Iframe for 3D viewer */}
        {!hasError && (
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title={`3D Diamond Viewer - ${stockNumber}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="accelerometer; gyroscope; fullscreen"
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
                <DialogTitle>3D Diamond Viewer - #{stockNumber}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-full">
                <iframe
                  src={viewerUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title={`3D Diamond Viewer - ${stockNumber}`}
                  allow="accelerometer; gyroscope; fullscreen"
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
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-purple-600"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle>3D Diamond Viewer - #{stockNumber}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full">
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0 rounded-lg"
            title={`3D Diamond Viewer - ${stockNumber}`}
            allow="accelerometer; gyroscope; fullscreen"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
