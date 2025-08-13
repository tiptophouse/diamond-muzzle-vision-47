import { useState, useEffect, useCallback } from 'react';

interface CacheEntry {
  url: string;
  timestamp: number;
  blob: Blob;
}

interface ImageCache {
  [key: string]: CacheEntry;
}

export interface UseCachedImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  cacheHit: boolean;
  prefetchNext: () => void;
}

const imageCache: ImageCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cached images

export function useCachedImage(originalUrl: string | undefined, diamondId: string): UseCachedImageReturn {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheHit, setCacheHit] = useState(false);

  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const entries = Object.entries(imageCache);
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > CACHE_DURATION) {
        URL.revokeObjectURL(entry.url);
        delete imageCache[key];
      }
    });

    // If still too many entries, remove oldest ones
    const remainingEntries = Object.entries(imageCache);
    if (remainingEntries.length > MAX_CACHE_SIZE) {
      const sortedEntries = remainingEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = sortedEntries.slice(0, remainingEntries.length - MAX_CACHE_SIZE);
      
      toRemove.forEach(([key, entry]) => {
        URL.revokeObjectURL(entry.url);
        delete imageCache[key];
      });
    }
  }, []);

  const cacheImage = useCallback(async (url: string, key: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if already cached and not expired
      const cached = imageCache[key];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setCacheHit(true);
        return cached.url;
      }

      // Fetch and cache the image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Clean up old cache entries before adding new one
      cleanupCache();

      // Cache the new image
      imageCache[key] = {
        url: objectUrl,
        timestamp: Date.now(),
        blob
      };

      setCacheHit(false);
      return objectUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cache image';
      setError(errorMessage);
      console.error('Image caching error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cleanupCache]);

  const prefetchNext = useCallback(() => {
    // This could be enhanced to prefetch related diamonds
    console.log('Prefetch next images for diamond:', diamondId);
  }, [diamondId]);

  useEffect(() => {
    if (!originalUrl) {
      setCachedUrl(null);
      setCacheHit(false);
      return;
    }

    const cacheKey = `diamond_${diamondId}_${originalUrl}`;
    
    // Check immediate cache hit
    const cached = imageCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setCachedUrl(cached.url);
      setCacheHit(true);
      return;
    }

    // Cache the image
    cacheImage(originalUrl, cacheKey).then(url => {
      if (url) {
        setCachedUrl(url);
      }
    });
  }, [originalUrl, diamondId, cacheImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cachedUrl && !imageCache[`diamond_${diamondId}_${originalUrl}`]) {
        URL.revokeObjectURL(cachedUrl);
      }
    };
  }, [cachedUrl, diamondId, originalUrl]);

  return {
    imageUrl: cachedUrl || originalUrl || null,
    isLoading,
    error,
    cacheHit,
    prefetchNext
  };
}
