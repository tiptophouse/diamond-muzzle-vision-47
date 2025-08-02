import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Maximize2, ExternalLink } from 'lucide-react';
import { useTelegramAccelerometer } from '@/hooks/useTelegramAccelerometer';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Custom360ImageViewer } from './Custom360ImageViewer';
import { V360Viewer } from './V360Viewer';

interface TiltControlled360ViewerProps {
  v360Url?: string;
  imageFrames?: string[];
  stockNumber: string;
  isInline?: boolean;
  className?: string;
}

export function TiltControlled360Viewer({
  v360Url,
  imageFrames,
  stockNumber,
  isInline = false,
  className = ''
}: TiltControlled360ViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTiltEnabled, setIsTiltEnabled] = useState(false);
  const [viewerType, setViewerType] = useState<'custom' | 'iframe' | 'fallback'>('fallback');
  
  const { accelerometerData, isSupported: isAccelSupported, isActive } = useTelegramAccelerometer(isTiltEnabled, 30);
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  // Determine best viewer type
  useEffect(() => {
    if (imageFrames && imageFrames.length > 0) {
      setViewerType('custom');
    } else if (v360Url) {
      setViewerType('iframe');
    } else {
      setViewerType('fallback');
    }
  }, [imageFrames, v360Url]);

  const enableTiltControl = useCallback(() => {
    if (isAccelSupported && viewerType === 'custom') {
      setIsTiltEnabled(true);
      impactOccurred('medium');
      notificationOccurred('success');
    }
  }, [isAccelSupported, viewerType, impactOccurred, notificationOccurred]);

  const disableTiltControl = useCallback(() => {
    setIsTiltEnabled(false);
    impactOccurred('light');
  }, [impactOccurred]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    impactOccurred('medium');
  }, [isFullscreen, impactOccurred]);

  const resetView = useCallback(() => {
    // Reset logic handled by child components
    impactOccurred('light');
  }, [impactOccurred]);

  const openInNewTab = useCallback(() => {
    if (v360Url) {
      window.open(v360Url, '_blank');
      impactOccurred('medium');
    }
  }, [v360Url, impactOccurred]);

  const renderViewer = () => {
    if (viewerType === 'custom' && imageFrames) {
      return (
        <Custom360ImageViewer
          imageFrames={imageFrames}
          stockNumber={stockNumber}
          accelerometerData={isTiltEnabled ? accelerometerData : undefined}
          className="w-full h-full"
        />
      );
    } else if (viewerType === 'iframe' && v360Url) {
      return (
        <V360Viewer
          v360Url={v360Url}
          stockNumber={stockNumber}
          isInline={true}
          className="w-full h-full"
        />
      );
    } else {
      return (
        <div className="w-full h-full bg-muted/10 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-sm">360° view not available</p>
        </div>
      );
    }
  };

  const renderControls = () => (
    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {viewerType === 'custom' && isAccelSupported && (
        <Button
          variant="secondary"
          size="sm"
          onClick={isTiltEnabled ? disableTiltControl : enableTiltControl}
          className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
        >
          <span className="text-xs">{isTiltEnabled ? '📱' : '🎯'}</span>
        </Button>
      )}
      
      <Button
        variant="secondary"
        size="sm"
        onClick={resetView}
        className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
      >
        <RotateCcw className="h-3 w-3" />
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleFullscreen}
        className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
      >
        <Maximize2 className="h-3 w-3" />
      </Button>
      
      {v360Url && (
        <Button
          variant="secondary"
          size="sm"
          onClick={openInNewTab}
          className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  const renderTiltIndicator = () => {
    if (viewerType === 'custom' && isAccelSupported && !isTiltEnabled) {
      return (
        <div className="absolute bottom-2 left-2 right-2">
          <Button
            variant="outline"
            size="sm"
            onClick={enableTiltControl}
            className="w-full bg-background/90 hover:bg-background text-xs"
          >
            📱 Tap to enable tilt rotation
          </Button>
        </div>
      );
    }
    
    if (viewerType === 'custom' && isTiltEnabled && isActive) {
      return (
        <div className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs">
          Tilt to rotate • {accelerometerData.x.toFixed(1)}°
        </div>
      );
    }
    
    if (viewerType === 'iframe') {
      return (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-background/90 text-foreground px-2 py-1 rounded text-xs text-center">
            ↔️ Drag to rotate inside viewer
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (isInline) {
    return (
      <div className={`relative group ${className}`}>
        {renderViewer()}
        {renderControls()}
        {renderTiltIndicator()}
        
        {/* Fullscreen Modal */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
            <div className="relative w-full h-full group">
              {renderViewer()}
              {renderControls()}
              {renderTiltIndicator()}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {renderViewer()}
      {renderControls()}
      {renderTiltIndicator()}
    </div>
  );
}