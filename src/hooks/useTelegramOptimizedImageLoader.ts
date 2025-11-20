/**
 * Telegram Mini App SDK Optimized Image Loader
 * Implements official Telegram Mini App best practices for image loading
 * Based on: https://core.telegram.org/bots/webapps
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTelegramSDK } from './useTelegramSDK';

interface TelegramImageState {
  imageUrl: string | null;
  isLoading: boolean;
  hasError: boolean;
  isCached: boolean;
  loadTime?: number;
  format?: 'webp' | 'jpeg' | 'png';
  networkQuality?: 'slow' | 'fast' | 'offline';
}

interface TelegramImageLoaderOptions {
  stockNumber: string;
  originalUrl?: string | null;
  fallbackUrl?: string;
  priority?: 'high' | 'medium' | 'low';
  maxRetries?: number;
  cacheOnly?: boolean;
}

const CACHE_PREFIX = 'tg_img_';
const MAX_CACHE_SIZE = 30; // Conservative for Telegram WebView
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const MAX_IMAGE_SIZE = 800; // Telegram WebView optimal size
const NETWORK_TIMEOUT = 10000; // 10 seconds
const MEMORY_LIMIT = 50 * 1024 * 1024; // 50MB memory limit

export function useTelegramOptimizedImageLoader(options: TelegramImageLoaderOptions) {
  const { stockNumber, originalUrl, fallbackUrl, priority = 'medium', maxRetries = 3, cacheOnly = false } = options;
  
  const [state, setState] = useState<TelegramImageState>({
    imageUrl: null,
    isLoading: true,
    hasError: false,
    isCached: false,
    networkQuality: 'fast'
  });

  const { cloudStorage, haptic, device, features } = useTelegramSDK();
  const retryCountRef = useRef(0);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Detect network quality based on Telegram device info
  const detectNetworkQuality = useCallback((): 'slow' | 'fast' | 'offline' => {
    if (!navigator.onLine) return 'offline';
    
    // Use Telegram device info for network detection
    if (device.platform === 'android' && device.viewportHeight < 600) {
      return 'slow'; // Assume slower connection for smaller Android devices
    }
    
    // Check connection speed if available
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'slow';
      }
      if (connection.saveData) {
        return 'slow';
      }
    }
    
    return 'fast';
  }, [device]);

  // Optimize image URL for Telegram WebView
  const optimizeImageUrl = useCallback((url: string): string => {
    try {
      const urlObj = new URL(url);
      
      // Skip optimization for S3 URLs - they don't support query parameters
      if (urlObj.hostname.includes('amazonaws.com') || urlObj.hostname.includes('s3.')) {
        return url;
      }
      
      const params = new URLSearchParams(urlObj.search);
      
      // Telegram WebView supports WebP universally
      params.set('format', 'webp');
      
      // Optimize size for Telegram viewport
      const optimalWidth = Math.min(device.viewportHeight, MAX_IMAGE_SIZE);
      params.set('width', optimalWidth.toString());
      params.set('height', optimalWidth.toString());
      
      // Quality based on network and priority
      const networkQuality = detectNetworkQuality();
      let quality = 85;
      
      if (networkQuality === 'slow') {
        quality = priority === 'high' ? 75 : 60;
      } else if (priority === 'low') {
        quality = 70;
      }
      
      params.set('q', quality.toString());
      
      // Telegram-specific optimizations
      params.set('progressive', 'true');
      params.set('strip', 'true'); // Remove metadata
      
      urlObj.search = params.toString();
      return urlObj.toString();
    } catch (error) {
      console.warn('Failed to optimize image URL:', error);
      return url;
    }
  }, [device, priority, detectNetworkQuality]);

  // CloudStorage operations with error handling
  const getCachedImage = useCallback(async (key: string): Promise<string | null> => {
    if (!features.cloudStorage) return null;
    
    try {
      const cached = await cloudStorage.getItem(key);
      if (!cached) return null;

      const parsedCache = JSON.parse(cached);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        await cloudStorage.removeItem(key);
        return null;
      }

      return parsedCache.imageData;
    } catch (error) {
      console.warn('CloudStorage read error:', error);
      return null;
    }
  }, [features.cloudStorage, cloudStorage]);

  const setCachedImage = useCallback(async (key: string, imageData: string): Promise<void> => {
    if (!features.cloudStorage) return;
    
    try {
      // Check memory usage before caching
      const keys = await cloudStorage.getKeys();
      const imageKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      
      if (imageKeys.length >= MAX_CACHE_SIZE) {
        // Remove oldest entries
        const itemsToCheck = Math.min(imageKeys.length, 10);
        const oldEntries: Array<{ key: string; timestamp: number }> = [];
        
        for (let i = 0; i < itemsToCheck; i++) {
          const data = await cloudStorage.getItem(imageKeys[i]);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              oldEntries.push({ key: imageKeys[i], timestamp: parsed.timestamp });
            } catch (e) {
              // Remove invalid entries
              await cloudStorage.removeItem(imageKeys[i]);
            }
          }
        }
        
        // Remove oldest
        oldEntries.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = oldEntries.slice(0, 5);
        await Promise.all(toRemove.map(entry => cloudStorage.removeItem(entry.key)));
      }

      const cacheData = {
        imageData,
        timestamp: Date.now(),
        stockNumber,
        format: 'webp'
      };

      await cloudStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('CloudStorage write error:', error);
    }
  }, [features.cloudStorage, cloudStorage, stockNumber]);

  // Convert image to base64 with size limits for Telegram
  const imageToBase64 = useCallback(async (url: string): Promise<string> => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        timeout: NETWORK_TIMEOUT
      } as RequestInit);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      // Check size limit for Telegram WebView
      if (blob.size > MEMORY_LIMIT / 10) { // Max 5MB per image
        throw new Error('Image too large for Telegram cache');
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image: ${error}`);
    }
  }, []);

  // Validate image URL with timeout
  const validateImageUrl = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.src = '';
        reject(new Error('Image load timeout'));
      }, NETWORK_TIMEOUT);

      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image failed to load'));
      };

      img.src = url;
    });
  }, []);

  // Main image loading logic with Telegram optimizations
  const loadImage = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    const startTime = performance.now();
    const cacheKey = `${CACHE_PREFIX}${stockNumber}`;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      // Check Telegram CloudStorage first (fastest)
      const cachedImage = await getCachedImage(cacheKey);
      if (cachedImage) {
        const loadTime = performance.now() - startTime;
        setState({
          imageUrl: cachedImage,
          isLoading: false,
          hasError: false,
          isCached: true,
          loadTime,
          format: 'webp',
          networkQuality: detectNetworkQuality()
        });
        
        // Haptic feedback for cached load
        haptic.selection();
        return;
      }

      // If cache-only mode and nothing cached, show error
      if (cacheOnly) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          networkQuality: detectNetworkQuality()
        }));
        return;
      }

      // Determine best URL to load
      const urlToLoad = originalUrl && originalUrl.trim() && originalUrl !== 'null' 
        ? originalUrl 
        : fallbackUrl || `https://miniapp.mazalbot.com/api/diamond-image/${stockNumber}`;

      // Optimize URL for Telegram
      const optimizedUrl = optimizeImageUrl(urlToLoad);
      
      // Validate URL works
      await validateImageUrl(optimizedUrl);
      
      const loadTime = performance.now() - startTime;
      setState({
        imageUrl: optimizedUrl,
        isLoading: false,
        hasError: false,
        isCached: false,
        loadTime,
        format: 'webp',
        networkQuality: detectNetworkQuality()
      });

      // Cache image for next time (background task)
      if (features.cloudStorage && priority !== 'low') {
        setTimeout(async () => {
          try {
            const base64 = await imageToBase64(optimizedUrl);
            await setCachedImage(cacheKey, base64);
          } catch (error) {
            console.warn('Background caching failed:', error);
          }
        }, 100);
      }

      // Success haptic feedback
      haptic.impact('light');
      
    } catch (error) {
      console.warn(`Image load failed for ${stockNumber}:`, error);
      
      // Retry logic with exponential backoff
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
        
        setTimeout(() => {
          loadingRef.current = false;
          loadImage();
        }, retryDelay);
        return;
      }

      // Final error state
      const loadTime = performance.now() - startTime;
      setState({
        imageUrl: null,
        isLoading: false,
        hasError: true,
        isCached: false,
        loadTime,
        networkQuality: detectNetworkQuality()
      });

      // Error haptic feedback
      haptic.notification('error');
      
    } finally {
      loadingRef.current = false;
    }
  }, [
    stockNumber, originalUrl, fallbackUrl, priority, maxRetries, cacheOnly,
    getCachedImage, setCachedImage, optimizeImageUrl, validateImageUrl, 
    imageToBase64, detectNetworkQuality, haptic, features.cloudStorage
  ]);

  // Load image when dependencies change
  useEffect(() => {
    if (stockNumber) {
      retryCountRef.current = 0;
      loadImage();
    }
    
    // Cleanup abort controller
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [stockNumber, loadImage]);

  // Preload images for smooth scrolling
  const preloadImages = useCallback(async (stockNumbers: string[], imageUrls: string[]) => {
    if (!features.cloudStorage) return;
    
    const batchSize = 3; // Conservative for Telegram
    const networkQuality = detectNetworkQuality();
    
    if (networkQuality === 'offline') return;
    
    for (let i = 0; i < stockNumbers.length; i += batchSize) {
      const batch = stockNumbers.slice(i, i + batchSize);
      const urlBatch = imageUrls.slice(i, i + batchSize);
      
      const promises = batch.map(async (stockNum, index) => {
        const url = urlBatch[index];
        if (!url) return;
        
        const cacheKey = `${CACHE_PREFIX}${stockNum}`;
        const cached = await getCachedImage(cacheKey);
        
        if (!cached && networkQuality === 'fast') {
          try {
            const optimizedUrl = optimizeImageUrl(url);
            const base64 = await imageToBase64(optimizedUrl);
            await setCachedImage(cacheKey, base64);
          } catch (error) {
            console.warn(`Preload failed for ${stockNum}:`, error);
          }
        }
      });
      
      await Promise.allSettled(promises);
      
      // Small delay for Telegram WebView
      if (i + batchSize < stockNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, networkQuality === 'slow' ? 500 : 100));
      }
    }
  }, [features.cloudStorage, getCachedImage, setCachedImage, optimizeImageUrl, imageToBase64, detectNetworkQuality]);

  // Manual retry function
  const retryLoad = useCallback(() => {
    retryCountRef.current = 0;
    loadImage();
  }, [loadImage]);

  // Clear cache for memory management
  const clearImageCache = useCallback(async () => {
    if (!features.cloudStorage) return;
    
    try {
      const keys = await cloudStorage.getKeys();
      const imageKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      await Promise.all(
        imageKeys.map(key => cloudStorage.removeItem(key))
      );
      
      console.log(`Cleared ${imageKeys.length} cached images from Telegram CloudStorage`);
    } catch (error) {
      console.warn('Failed to clear image cache:', error);
    }
  }, [features.cloudStorage, cloudStorage]);

  return {
    ...state,
    retryLoad,
    preloadImages,
    clearImageCache,
    
    // Telegram-specific metrics
    metrics: {
      cacheHitRate: state.isCached ? 100 : 0,
      averageLoadTime: state.loadTime || 0,
      networkQuality: state.networkQuality,
      memoryUsage: 'optimized'
    }
  };
}