import { useState, useEffect, useCallback } from 'react';
import { telegramImageCache } from '@/services/telegramImageCache';
import { useTelegramSDK } from './useTelegramSDK';

interface ImageLoaderState {
  imageUrl: string | null;
  isLoading: boolean;
  hasError: boolean;
  isCached: boolean;
  loadTime?: number;
}

interface UseImageLoaderProps {
  stockNumber: string;
  originalUrl?: string | null;
  fallbackUrl?: string;
  priority?: boolean;
}

export function useTelegramImageLoader({
  stockNumber,
  originalUrl,
  fallbackUrl,
  priority = false
}: UseImageLoaderProps) {
  const [state, setState] = useState<ImageLoaderState>({
    imageUrl: null,
    isLoading: true,
    hasError: false,
    isCached: false
  });
  
  const { haptic } = useTelegramSDK();
  
  const loadImage = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      // First, try to get from Telegram cache
      const cachedImage = await telegramImageCache.getCachedImage(stockNumber);
      
      if (cachedImage) {
        const loadTime = performance.now() - startTime;
        setState({
          imageUrl: cachedImage,
          isLoading: false,
          hasError: false,
          isCached: true,
          loadTime
        });
        
        // Success haptic for cached load
        haptic?.notification?.('success');
        return;
      }
      
      // If not cached, use original or fallback URL
      const urlToLoad = originalUrl && originalUrl.trim() && originalUrl !== 'null' 
        ? originalUrl 
        : fallbackUrl || `https://miniapp.mazalbot.com/api/diamond-image/${stockNumber}`;
      
      // Validate URL works before setting
      await validateImageUrl(urlToLoad);
      
      const loadTime = performance.now() - startTime;
      setState({
        imageUrl: urlToLoad,
        isLoading: false,
        hasError: false,
        isCached: false,
        loadTime
      });
      
      // Cache the image in background for next time
      if (urlToLoad) {
        telegramImageCache.cacheImage(stockNumber, urlToLoad).catch(console.warn);
      }
      
      // Success haptic for network load
      haptic?.notification?.('success');
      
    } catch (error) {
      console.warn(`Failed to load image for ${stockNumber}:`, error);
      
      const loadTime = performance.now() - startTime;
      setState({
        imageUrl: null,
        isLoading: false,
        hasError: true,
        isCached: false,
        loadTime
      });
      
      // Error haptic
      haptic?.notification?.('error');
    }
  }, [stockNumber, originalUrl, fallbackUrl, haptic]);
  
  // Validate if URL actually returns an image
  const validateImageUrl = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = url;
    });
  }, []);
  
  // Load image on mount or when dependencies change
  useEffect(() => {
    if (stockNumber) {
      loadImage();
    }
  }, [stockNumber, loadImage]);
  
  // Preload next images for better UX
  const preloadImages = useCallback(async (stockNumbers: string[], imageUrls: string[]) => {
    try {
      await telegramImageCache.prefetchImages(stockNumbers, imageUrls);
    } catch (error) {
      console.warn('Failed to preload images:', error);
    }
  }, []);
  
  const retryLoad = useCallback(() => {
    loadImage();
  }, [loadImage]);
  
  return {
    ...state,
    retryLoad,
    preloadImages
  };
}