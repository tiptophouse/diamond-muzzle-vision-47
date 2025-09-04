import { useState, useCallback, useRef, useEffect } from 'react';
import { Gem, Eye, Sparkles } from 'lucide-react';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images
    
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
        rootMargin: '50px 0px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [priority]);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Determine what type of media we have
  const has3D = gem360Url && gem360Url.trim();
  const hasImage = imageUrl && imageUrl.trim() && imageUrl !== 'default';
  const shouldShowImage = isInView && hasImage && !hasError;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary-glow/10 ${className}`}
    >
      {/* Loading State */}
      {!isLoaded && shouldShowImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full flex items-center justify-center">
              <Gem className="h-8 w-8 text-primary/40 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Optimized Image */}
      {shouldShowImage && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={`${shape} Diamond #${stockNumber}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          // Performance optimizations
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '200px 200px'
          }}
        />
      )}

      {/* 3D/360° Badge */}
      {has3D && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 text-xs flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            360°
          </Badge>
        </div>
      )}

      {/* Image Badge */}
      {hasImage && !has3D && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" />
            HD
          </Badge>
        </div>
      )}

      {/* Fallback - No Image */}
      {(!hasImage || hasError) && !shouldShowImage && (
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg">
              <Gem className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Image Quality Indicator */}
      {isLoaded && hasImage && (
        <div className="absolute bottom-2 right-2">
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
        </div>
      )}
    </div>
  );
}