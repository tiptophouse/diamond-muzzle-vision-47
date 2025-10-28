import { useState, useEffect, useRef, memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyGem360ViewerProps {
  gem360Url: string;
  stockNumber: string;
  className?: string;
}

const LazyGem360Viewer = memo(({ gem360Url, stockNumber, className = "" }: LazyGem360ViewerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const processedUrl = (() => {
    if (gem360Url.startsWith('http')) return gem360Url;
    if (gem360Url.startsWith('//')) return `https:${gem360Url}`;
    return `https://${gem360Url}`;
  })();

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden ${className}`}
    >
      {!isVisible ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <p className="text-xs">360° View</p>
          </div>
        </div>
      ) : (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
          <iframe
            src={processedUrl}
            className={`w-full h-full border-0 transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            allow="accelerometer; gyroscope"
            sandbox="allow-scripts allow-same-origin"
            title={`360° View of Diamond ${stockNumber}`}
          />
        </>
      )}
    </div>
  );
});

LazyGem360Viewer.displayName = 'LazyGem360Viewer';

export { LazyGem360Viewer };
