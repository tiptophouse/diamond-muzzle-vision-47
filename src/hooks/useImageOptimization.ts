import { useState, useEffect, useCallback, useRef } from 'react';

interface ImageOptimizationOptions {
  url?: string | null;
  priority?: boolean;
  placeholder?: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  fallbacks?: string[];
  maxRetries?: number;
  preload?: boolean;
}

interface ImageOptimizationState {
  src: string | null;
  isLoading: boolean;
  hasError: boolean;
  loadTime: number | null;
  format: string | null;
  isCached: boolean;
  retry: () => void;
}

// Image format detection and optimization
const getOptimalImageUrl = (url: string, options: ImageOptimizationOptions): string => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    // Add format optimization
    if (options.format === 'auto') {
      // Check browser support for modern formats
      if (supportsWebP()) {
        params.set('format', 'webp');
      } else if (supportsAVIF()) {
        params.set('format', 'avif');
      }
    } else if (options.format) {
      params.set('format', options.format);
    }
    
    // Add quality optimization
    if (options.quality && options.quality < 100) {
      params.set('q', options.quality.toString());
    }
    
    // Add responsive sizing for mobile
    if (window.innerWidth < 768) {
      params.set('w', '400');
    } else {
      params.set('w', '800');
    }
    
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (error) {
    // Return original URL if modification fails
    return url;
  }
};

// Browser feature detection
const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

// Image cache for memory optimization
const imageCache = new Map<string, HTMLImageElement>();
const MAX_CACHE_SIZE = 50; // Limit cache size for Telegram

const cleanupCache = () => {
  if (imageCache.size > MAX_CACHE_SIZE) {
    const keys = Array.from(imageCache.keys());
    const toRemove = keys.slice(0, keys.length - MAX_CACHE_SIZE);
    toRemove.forEach(key => {
      const img = imageCache.get(key);
      if (img) {
        img.src = ''; // Clear src to free memory
        imageCache.delete(key);
      }
    });
  }
};

export function useImageOptimization(options: ImageOptimizationOptions): ImageOptimizationState {
  const [src, setSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  
  const retryCount = useRef(0);
  const startTime = useRef<number>(0);
  const currentUrl = useRef<string | null>(null);
  
  const loadImage = useCallback(async (url: string, attempt = 0): Promise<void> => {
    if (!url) return;
    
    const optimizedUrl = getOptimalImageUrl(url, options);
    currentUrl.current = optimizedUrl;
    
    // Check cache first
    if (imageCache.has(optimizedUrl)) {
      const cachedImg = imageCache.get(optimizedUrl)!;
      if (cachedImg.complete && cachedImg.naturalWidth > 0) {
        setSrc(optimizedUrl);
        setIsLoading(false);
        setHasError(false);
        setIsCached(true);
        setFormat(optimizedUrl.includes('webp') ? 'webp' : optimizedUrl.includes('avif') ? 'avif' : 'jpeg');
        return;
      }
    }
    
    setIsLoading(true);
    setHasError(false);
    setIsCached(false);
    startTime.current = performance.now();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set loading attributes for optimization
      img.loading = options.priority ? 'eager' : 'lazy';
      img.decoding = 'async';
      
      img.onload = () => {
        if (currentUrl.current !== optimizedUrl) return; // Prevent race conditions
        
        const duration = performance.now() - startTime.current;
        
        // Cache the successful image
        imageCache.set(optimizedUrl, img);
        cleanupCache();
        
        setSrc(optimizedUrl);
        setIsLoading(false);
        setHasError(false);
        setLoadTime(duration);
        setFormat(optimizedUrl.includes('webp') ? 'webp' : optimizedUrl.includes('avif') ? 'avif' : 'jpeg');
        
        resolve();
      };
      
      img.onerror = () => {
        if (currentUrl.current !== optimizedUrl) return;
        
        const maxRetries = options.maxRetries || 2;
        const fallbacks = options.fallbacks || [];
        
        // Try fallback URLs first
        if (attempt < fallbacks.length) {
          loadImage(fallbacks[attempt], attempt + 1);
          return;
        }
        
        // Retry with original URL if optimization failed
        if (attempt === 0 && optimizedUrl !== url) {
          loadImage(url, attempt + 1);
          return;
        }
        
        // Final retry attempts
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          setTimeout(() => {
            loadImage(url, attempt);
          }, Math.pow(2, retryCount.current) * 1000); // Exponential backoff
          return;
        }
        
        setIsLoading(false);
        setHasError(true);
        setLoadTime(null);
        reject(new Error('Failed to load image'));
      };
      
      img.src = optimizedUrl;
      
      // Preload if requested
      if (options.preload) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = optimizedUrl;
        document.head.appendChild(link);
      }
    });
  }, [options]);
  
  const retry = useCallback(() => {
    if (options.url) {
      retryCount.current = 0;
      loadImage(options.url);
    }
  }, [options.url, loadImage]);
  
  // Load image when URL changes
  useEffect(() => {
    if (options.url) {
      loadImage(options.url);
    } else {
      setSrc(null);
      setIsLoading(false);
      setHasError(false);
      setLoadTime(null);
      setFormat(null);
      setIsCached(false);
    }
    
    return () => {
      currentUrl.current = null; // Cancel any pending loads
    };
  }, [options.url, loadImage]);
  
  return {
    src,
    isLoading,
    hasError,
    loadTime,
    format,
    isCached,
    retry
  };
}