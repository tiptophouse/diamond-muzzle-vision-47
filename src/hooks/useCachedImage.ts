
import { useState, useEffect } from 'react';

export interface UseCachedImageReturn {
  src: string | null;
  imageUrl: string | null;
  cacheHit: boolean;
  isCached: boolean;
  isLoading: boolean;
  error: boolean;
  prefetchNext: (nextImages: { url: string; id: string }[]) => void;
}

interface UseCachedImageOptions {
  imageUrl?: string;
  diamondId?: string;
  enablePrefetch?: boolean;
}

export function useCachedImage(
  optionsOrUrl?: string | UseCachedImageOptions, 
  cacheKey?: string
): UseCachedImageReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cacheHit, setCacheHit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  // Handle both old string format and new options format
  const options = typeof optionsOrUrl === 'string' 
    ? { imageUrl: optionsOrUrl } 
    : optionsOrUrl || {};

  const originalUrl = options.imageUrl;

  useEffect(() => {
    if (!originalUrl) {
      setImageUrl(null);
      setCacheHit(false);
      setIsLoading(false);
      setError(false);
      return;
    }

    setIsLoading(true);
    setError(false);

    // For now, just return the original URL
    // In a full implementation, this would check local storage/cache
    setTimeout(() => {
      setImageUrl(originalUrl);
      setCacheHit(false); // Would be true if found in cache
      setIsLoading(false);
    }, 100);

  }, [originalUrl, cacheKey]);

  const prefetchNext = (nextImages: { url: string; id: string }[]) => {
    // Prefetch implementation would go here
    console.log('Prefetching images:', nextImages);
  };

  return {
    src: imageUrl, // For compatibility
    imageUrl,
    cacheHit,
    isCached: cacheHit, // For compatibility
    isLoading,
    error,
    prefetchNext
  };
}
