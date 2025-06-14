
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

  // Extract the viewer URL from the Gem360 link
  const getViewerUrl = (url: string) => {
    // If it's already a direct gem360 URL, use it
    if (url.includes('view.gem360.in')) {
      return url;
    }
    return url;
  };

  const viewerUrl = getViewerUrl(gem360Url);

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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading 3D viewer...</p>
            </div>
          </div>
        )}
        
        {/* Iframe for 3D viewer */}
        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          title={`3D Diamond Viewer - ${stockNumber}`}
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; gyroscope"
        />
        
        {/* Expand button */}
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
                allow="accelerometer; gyroscope"
              />
            </div>
          </DialogContent>
        </Dialog>
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
            allow="accelerometer; gyroscope"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
