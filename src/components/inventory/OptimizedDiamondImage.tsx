import { memo, useState, useRef, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

interface OptimizedDiamondImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export const OptimizedDiamondImage = memo(function OptimizedDiamondImage({ 
  src, 
  alt, 
  className = "w-12 h-12 object-cover rounded", 
  fallbackClassName = "w-12 h-12 flex items-center justify-center bg-muted rounded"
}: OptimizedDiamondImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  if (!src || hasError) {
    return (
      <div ref={containerRef} className={fallbackClassName}>
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {isInView && (
        <>
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className={`${className} bg-muted animate-pulse`} />
          )}
          
          {/* Actual image */}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}
      
      {/* Fallback for not in view */}
      {!isInView && (
        <div className={`${className} bg-muted animate-pulse`} />
      )}
    </div>
  );
});