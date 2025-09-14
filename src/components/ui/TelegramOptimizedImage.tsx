/**
 * Telegram Mini App Optimized Image Component
 * Implements Telegram WebApp best practices for image display
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTelegramOptimizedImageLoader } from '@/hooks/useTelegramOptimizedImageLoader';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './button';

interface TelegramOptimizedImageProps {
  stockNumber: string;
  src?: string | null;
  alt: string;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
  fallbackUrl?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  showMetrics?: boolean;
  cacheOnly?: boolean;
}

export function TelegramOptimizedImage({
  stockNumber,
  src,
  alt,
  className = '',
  priority = 'medium',
  fallbackUrl,
  onLoad,
  onError,
  showMetrics = false,
  cacheOnly = false
}: TelegramOptimizedImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [showImage, setShowImage] = useState(false);
  
  const { 
    imageUrl, 
    isLoading, 
    hasError, 
    isCached,
    loadTime,
    format,
    networkQuality,
    retryLoad,
    metrics 
  } = useTelegramOptimizedImageLoader({
    stockNumber,
    originalUrl: src,
    fallbackUrl,
    priority,
    cacheOnly: cacheOnly || priority === 'low'
  });

  const { haptic, device } = useTelegramSDK();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

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
        // Telegram WebView optimized thresholds
        rootMargin: priority === 'high' ? '50px' : '100px',
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Handle successful image load
  useEffect(() => {
    if (imageUrl && !hasError) {
      setShowImage(true);
      onLoad?.();
      
      // Haptic feedback for successful load
      if (priority === 'high') {
        haptic.impact('light');
      }
    }
  }, [imageUrl, hasError, onLoad, haptic, priority]);

  // Handle image load error
  useEffect(() => {
    if (hasError) {
      onError?.(new Error('Image failed to load'));
      
      // Error haptic feedback
      if (priority === 'high') {
        haptic.notification('error');
      }
    }
  }, [hasError, onError, haptic, priority]);

  const handleRetry = useCallback(() => {
    haptic.selection();
    retryLoad();
  }, [haptic, retryLoad]);

  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-full bg-muted animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {networkQuality === 'slow' ? 'Loading...' : 'Optimizing...'}
        </span>
        {showMetrics && (
          <div className="text-xs text-muted-foreground/70">
            {format && `${format.toUpperCase()}`}
            {loadTime && ` • ${Math.round(loadTime)}ms`}
          </div>
        )}
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex items-center justify-center h-full bg-muted/50">
      <div className="flex flex-col items-center gap-3 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {networkQuality === 'offline' ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <Wifi className="h-5 w-5" />
          )}
          <span className="text-sm">
            {networkQuality === 'offline' ? 'Offline' : 'Load Failed'}
          </span>
        </div>
        
        {networkQuality !== 'offline' && (
          <Button
            onClick={handleRetry}
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
        
        {showMetrics && (
          <div className="text-xs text-muted-foreground/70 text-center">
            Stock: {stockNumber}
            {loadTime && <br />}
            {loadTime && `Load time: ${Math.round(loadTime)}ms`}
          </div>
        )}
      </div>
    </div>
  );

  const renderImage = () => (
    <div className="relative w-full h-full">
      <img
        ref={imgRef}
        src={imageUrl || undefined}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          showImage ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading={priority === 'high' ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          // Telegram WebView optimizations
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)', // Hardware acceleration
        }}
      />
      
      {/* Performance indicators for development */}
      {showMetrics && (process.env.NODE_ENV === 'development' || device.platform === 'unknown') && (
        <div className="absolute top-1 left-1 bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          {isCached && <span className="text-green-400">💾</span>}
          <span className="text-blue-300">{format}</span>
          {loadTime && <span className="text-yellow-300">{Math.round(loadTime)}ms</span>}
          {networkQuality !== 'fast' && (
            <span className="text-orange-300">{networkQuality}</span>
          )}
        </div>
      )}
      
      {/* Cache indicator */}
      {isCached && showMetrics && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm" />
        </div>
      )}
    </div>
  );

  // Don't render until in view (lazy loading)
  if (!isInView && priority !== 'high') {
    return (
      <div 
        ref={containerRef}
        className={`bg-muted animate-pulse ${className}`}
        style={{ minHeight: '200px' }}
      />
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {isLoading && renderLoadingState()}
      {hasError && renderErrorState()}
      {imageUrl && !hasError && renderImage()}
      
      {/* Telegram theme-aware skeleton */}
      {!imageUrl && !hasError && !isLoading && (
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
      )}
    </div>
  );
}