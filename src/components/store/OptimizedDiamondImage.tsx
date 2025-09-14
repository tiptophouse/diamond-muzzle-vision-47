import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { V360Viewer } from './V360Viewer';
import { Eye, RotateCcw, Zap, Gem, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OptimizedDiamondImageProps {
  imageUrl?: string | null;
  gem360Url?: string | null;
  stockNumber: string;
  shape: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedDiamondImage({
  imageUrl,
  gem360Url,
  stockNumber,
  shape,
  className = '',
  priority = false,
  onLoad,
  onError
}: OptimizedDiamondImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [show360, setShow360] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { haptic } = useTelegramSDK();

  // Determine what type of media we have
  const has3D = gem360Url && gem360Url.trim() && gem360Url !== 'null';
  const hasImage = imageUrl && imageUrl.trim() && imageUrl !== 'default' && imageUrl !== 'null';
  const fallbackUrl = `https://miniapp.mazalbot.com/api/diamond-image/${stockNumber}`;
  const finalImageUrl = hasImage ? imageUrl : fallbackUrl;

  // Native image loading with telegram haptic feedback
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageLoaded(true);
    setHasError(false);
    
    // Haptic feedback for successful load
    if (haptic?.notification) {
      haptic.notification('success');
    }
    
    onLoad?.();
  }, [onLoad, haptic]);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    
    // Haptic feedback for error
    if (haptic?.notification) {
      haptic.notification('error');
    }
    
    onError?.();
  }, [onError, haptic]);

  const handle360Toggle = useCallback(() => {
    if (has3D) {
      // Impact feedback for 360 toggle
      if (haptic?.impact) {
        haptic.impact('medium');
      }
      setShow360(!show360);
    }
  }, [has3D, show360, haptic]);

  // Optimized intersection observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start loading before fully visible
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [priority]);

  // Show 360° viewer if active
  if (show360 && has3D) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <V360Viewer 
          v360Url={gem360Url} 
          stockNumber={stockNumber}
          className="w-full h-full"
        />
        <button
          onClick={handle360Toggle}
          className="absolute top-2 left-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-10"
          aria-label="Exit 360° view"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const shouldShowImage = isInView && (hasImage || !hasError);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary-glow/10 ${className}`}
    >
      {/* Loading shimmer effect */}
      {isLoading && shouldShowImage && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full flex items-center justify-center">
              <Gem className="h-8 w-8 text-primary/40 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Main image */}
      {shouldShowImage && (
        <img
          ref={imageRef}
          src={finalImageUrl}
          alt={`${shape} diamond - Stock #${stockNumber}`}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            imageRendering: 'crisp-edges',
            contentVisibility: 'auto',
            containIntrinsicSize: '200px 200px'
          }}
        />
      )}

      {/* Error state or no image */}
      {(hasError || !shouldShowImage) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg">
              <Gem className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-sm font-medium mt-2 text-muted-foreground">Stock #{stockNumber}</p>
        </div>
      )}

      {/* Success indicator */}
      {imageLoaded && !hasError && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse" />
      )}

      {/* 360° Badge */}
      {has3D && (
        <button
          onClick={handle360Toggle}
          className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-black/80 transition-all duration-200 flex items-center gap-1.5 shadow-lg"
          aria-label="View in 360°"
        >
          <Eye className="h-3 w-3" />
          360°
        </button>
      )}

      {/* HD Quality indicator */}
      {imageLoaded && !hasError && !has3D && (
        <div className="absolute bottom-2 right-2 bg-primary/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          <Zap className="h-3 w-3" />
          HD
        </div>
      )}

      {/* 3D Badge alternative position */}
      {has3D && !show360 && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 text-xs flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            360°
          </Badge>
        </div>
      )}
    </div>
  );
}