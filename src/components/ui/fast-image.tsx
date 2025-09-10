import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  blur?: boolean;
  priority?: boolean;
}

export function FastImage({ 
  src, 
  fallbackSrc, 
  className, 
  alt, 
  blur = true,
  priority = false,
  ...props 
}: FastImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Preload image for priority images
  useEffect(() => {
    if (priority && src) {
      const img = new Image();
      img.src = src;
    }
  }, [src, priority]);
  
  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
    setCurrentSrc(src);
  }, [src]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setError(false);
    } else {
      setError(true);
    }
  };
  
  if (error) {
    return (
      <div 
        className={cn(
          "bg-muted/30 flex items-center justify-center",
          className
        )}
      >
        <div className="text-muted-foreground text-sm">
          Failed to load image
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder */}
      {blur && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse" />
      )}
      
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
    </div>
  );
}