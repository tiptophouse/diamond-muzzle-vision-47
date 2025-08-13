
import { useState, useEffect, useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { telegramImageCache } from '@/services/telegramImageCache';

interface UseCachedImageProps {
  imageUrl?: string;
  diamondId: string;
  enablePrefetch?: boolean;
}

interface UseCachedImageReturn {
  src: string | null;
  isLoading: boolean;
  error: boolean;
  isCached: boolean;
  prefetchNext: (urls: { url: string; id: string }[]) => void;
}

export function useCachedImage({ 
  imageUrl, 
  diamondId, 
  enablePrefetch = true 
}: UseCachedImageProps): UseCachedImageReturn {
  const [src, setSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const { webApp, isReady } = useTelegramWebApp();

  // Initialize cache service with webApp when ready
  useEffect(() => {
    if (isReady && webApp) {
      telegramImageCache.setWebApp(webApp);
    }
  }, [isReady, webApp]);

  const loadImage = useCallback(async () => {
    if (!imageUrl || !diamondId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(false);

    try {
      // First, try to get cached image
      const cachedImage = await telegramImageCache.getCachedImage(diamondId);
      
      if (cachedImage) {
        setSrc(cachedImage);
        setIsCached(true);
        setIsLoading(false);
        console.log('🚀 Using cached image for:', diamondId);
        return;
      }

      // If not cached, use original URL and cache in background
      setSrc(imageUrl);
      setIsCached(false);
      setIsLoading(false);

      // Cache the image for future use (don't await to avoid blocking)
      if (enablePrefetch) {
        telegramImageCache.cacheImage(imageUrl, diamondId).then(success => {
          if (success) {
            console.log('📦 Background cached:', diamondId);
          }
        });
      }

    } catch (err) {
      console.error('❌ Error loading image:', err);
      setError(true);
      setSrc(imageUrl || null); // Fallback to original URL
      setIsLoading(false);
    }
  }, [imageUrl, diamondId, enablePrefetch]);

  // Prefetch function for batch caching
  const prefetchNext = useCallback(async (urls: { url: string; id: string }[]) => {
    if (!enablePrefetch) return;

    // Cache images in background without blocking UI
    urls.forEach(async ({ url, id }) => {
      try {
        const cached = await telegramImageCache.getCachedImage(id);
        if (!cached) {
          telegramImageCache.cacheImage(url, id);
        }
      } catch (error) {
        console.warn('Prefetch failed for:', id, error);
      }
    });
  }, [enablePrefetch]);

  // Load image when dependencies change
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  return {
    src,
    isLoading,
    error,
    isCached,
    prefetchNext
  };
}
