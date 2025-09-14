import React, { useState, useRef, useEffect, memo } from 'react';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { Gem, RefreshCw } from 'lucide-react';

interface LazyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  fallbacks?: string[];
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  rootMargin?: string;
  threshold?: number;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  priority = false,
  placeholder,
  fallbacks = [],
  quality = 85,
  onLoad,
  onError,
  rootMargin = '50px',
  threshold = 0.1
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [showImage, setShowImage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    src: optimizedSrc,
    isLoading,
    hasError,
    loadTime,
    format,
    isCached,
    retry
  } = useImageOptimization({
    url: isInView ? src : null,
    priority,
    placeholder,
    quality,
    format: 'auto',
    fallbacks,
    maxRetries: 3,
    preload: priority
  });
  
  // Intersection Observer for lazy loading
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
        threshold,
        rootMargin
      }
    );
    
    observer.observe(container);
    return () => observer.disconnect();
  }, [priority, threshold, rootMargin]);
  
  // Handle load success
  useEffect(() => {
    if (optimizedSrc && !isLoading && !hasError) {
      setShowImage(true);
      onLoad?.();
    }
  }, [optimizedSrc, isLoading, hasError, onLoad]);
  
  // Handle load error
  useEffect(() => {
    if (hasError) {
      onError?.();
    }
  }, [hasError, onError]);
  
  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full flex items-center justify-center">
              <Gem className="h-6 w-6 text-primary/40 animate-pulse" />
            </div>
          </div>
          
          {/* Performance indicators */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isCached && (
              <div className="bg-blue-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-medium">
                📱
              </div>
            )}
            {format && (
              <div className="bg-purple-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-medium uppercase">
                {format}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main Image */}
      {optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-500 ${
            showImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            imageRendering: 'crisp-edges',
            contentVisibility: 'auto',
            containIntrinsicSize: '200px 200px'
          }}
        />
      )}
      
      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg mb-2">
            <Gem className="h-6 w-6 text-primary-foreground" />
          </div>
          <button 
            onClick={retry}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}
      
      {/* Placeholder for non-priority images */}
      {!isInView && !priority && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
          <Gem className="h-8 w-8 text-slate-400" />
        </div>
      )}
      
      {/* Performance Badge */}
      {showImage && loadTime && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg" />
          {loadTime < 100 && (
            <div className="bg-green-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-medium">
              ⚡
            </div>
          )}
          {isCached && (
            <div className="bg-blue-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-medium">
              📱
            </div>
          )}
        </div>
      )}
    </div>
  );
});