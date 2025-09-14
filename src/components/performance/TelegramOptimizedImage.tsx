import React, { useState, useCallback, useRef, useEffect } from 'react';
import { telegramPerformanceMonitor } from '@/services/telegramPerformanceMonitor';
import { telegramImageCache } from '@/services/telegramImageCache';

interface TelegramOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  stockNumber?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

export function TelegramOptimizedImage({
  src,
  alt,
  className = '',
  stockNumber,
  priority = false,
  onLoad,
  onError,
  fallback = '/placeholder.svg'
}: TelegramOptimizedImageProps) {
  const [imageState, setImageState] = useState<{
    loaded: boolean;
    error: boolean;
    src: string;
    cacheHit: boolean;
  }>({
    loaded: false,
    error: false,
    src: '',
    cacheHit: false
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const loadStartTime = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver>();

  // Optimized image loading with caching
  const loadImage = useCallback(async () => {
    if (!src) return;
    
    loadStartTime.current = performance.now();
    telegramPerformanceMonitor.startTimer('image_load');

    try {
      // Try cache first if stockNumber is available
      if (stockNumber) {
        const cachedSrc = await telegramImageCache.getCachedImage(stockNumber);
        if (cachedSrc) {
          console.log('📱 Image cache hit for:', stockNumber);
          setImageState(prev => ({
            ...prev,
            src: cachedSrc,
            cacheHit: true
          }));
          telegramPerformanceMonitor.recordMetric('cache_hit', performance.now() - loadStartTime.current);
          return;
        }
        telegramPerformanceMonitor.recordMetric('cache_miss', performance.now() - loadStartTime.current);
      }

      // Load from network
      setImageState(prev => ({ ...prev, src, cacheHit: false }));
      
      // Cache the image for future use
      if (stockNumber) {
        telegramImageCache.cacheImage(stockNumber, src).catch(error => {
          console.warn('Failed to cache image:', error);
        });
      }

    } catch (error) {
      console.warn('Image loading optimization failed:', error);
      setImageState(prev => ({ ...prev, src, cacheHit: false }));
    }
  }, [src, stockNumber]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) {
      loadImage();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observerRef.current?.disconnect();
          }
        });
      },
      { 
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.1 
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loadImage, priority]);

  // Handle successful image load
  const handleLoad = useCallback(() => {
    const loadTime = telegramPerformanceMonitor.endTimer('image_load', {
      stockNumber,
      cacheHit: imageState.cacheHit,
      imageSize: imgRef.current?.naturalWidth + 'x' + imgRef.current?.naturalHeight
    });

    setImageState(prev => ({ ...prev, loaded: true, error: false }));
    
    // Performance logging
    if (loadTime > 2000) {
      console.warn(`🐌 Slow image load detected: ${loadTime}ms for ${stockNumber || 'unknown'}`);
    }

    onLoad?.();
  }, [stockNumber, imageState.cacheHit, onLoad]);

  // Handle image load error
  const handleError = useCallback(() => {
    console.warn('❌ Image load failed:', src);
    setImageState(prev => ({ 
      ...prev, 
      error: true, 
      loaded: false,
      src: fallback 
    }));
    
    telegramPerformanceMonitor.recordMetric('image_error', performance.now() - loadStartTime.current, {
      originalSrc: src,
      stockNumber
    });

    onError?.();
  }, [src, fallback, stockNumber, onError]);

  // Retry mechanism
  const retryLoad = useCallback(() => {
    setImageState(prev => ({ ...prev, error: false, loaded: false }));
    loadImage();
  }, [loadImage]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {!imageState.loaded && !imageState.error && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-md flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Optimized image */}
      <img
        ref={imgRef}
        src={imageState.src}
        alt={alt}
        className={`
          transition-opacity duration-300
          ${imageState.loaded ? 'opacity-100' : 'opacity-0'}
          ${imageState.error ? 'opacity-50' : ''}
        `}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          contentVisibility: 'auto', // Performance optimization
          containIntrinsicSize: '300px 300px' // Helps with layout stability
        }}
      />

      {/* Error state with retry */}
      {imageState.error && (
        <div className="absolute inset-0 bg-muted/50 flex flex-col items-center justify-center text-center p-2">
          <div className="text-muted-foreground text-sm mb-2">Failed to load</div>
          <button
            onClick={retryLoad}
            className="text-xs text-primary underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Performance indicator (debug mode) */}
      {process.env.NODE_ENV === 'development' && imageState.cacheHit && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
          CACHED
        </div>
      )}
    </div>
  );
}

export default TelegramOptimizedImage;