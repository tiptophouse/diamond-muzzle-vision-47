import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

interface RequestCacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of cached entries
}

export function useRequestCache<T>(options: RequestCacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 50 } = options; // Default 5 minutes TTL
  const cache = useRef(new Map<string, CacheEntry<T>>());
  const pendingRequests = useRef(new Map<string, Promise<T>>());

  const getCacheKey = useCallback((key: string | object): string => {
    return typeof key === 'string' ? key : JSON.stringify(key);
  }, []);

  const get = useCallback((key: string | object): T | null => {
    const cacheKey = getCacheKey(key);
    const entry = cache.current.get(cacheKey);
    
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > ttl) {
      cache.current.delete(cacheKey);
      return null;
    }
    
    return entry.data;
  }, [getCacheKey, ttl]);

  const set = useCallback((key: string | object, data: T): void => {
    const cacheKey = getCacheKey(key);
    
    // Implement simple LRU by removing oldest entry if at max size
    if (cache.current.size >= maxSize) {
      const firstKey = cache.current.keys().next().value;
      if (firstKey) {
        cache.current.delete(firstKey);
      }
    }
    
    cache.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, [getCacheKey, maxSize]);

  const getOrFetch = useCallback(async (
    key: string | object,
    fetcher: () => Promise<T>
  ): Promise<T> => {
    const cacheKey = getCacheKey(key);
    
    // Return cached data if available and not expired
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }
    
    // Check if there's already a pending request for this key
    const pendingRequest = pendingRequests.current.get(cacheKey);
    if (pendingRequest) {
      return pendingRequest;
    }
    
    // Create new request
    const request = fetcher().then(data => {
      set(key, data);
      pendingRequests.current.delete(cacheKey);
      return data;
    }).catch(error => {
      pendingRequests.current.delete(cacheKey);
      throw error;
    });
    
    pendingRequests.current.set(cacheKey, request);
    return request;
  }, [getCacheKey, get, set]);

  const clear = useCallback((key?: string | object): void => {
    if (key) {
      const cacheKey = getCacheKey(key);
      cache.current.delete(cacheKey);
      pendingRequests.current.delete(cacheKey);
    } else {
      cache.current.clear();
      pendingRequests.current.clear();
    }
  }, [getCacheKey]);

  const has = useCallback((key: string | object): boolean => {
    return get(key) !== null;
  }, [get]);

  return {
    get,
    set,
    getOrFetch,
    clear,
    has,
    size: cache.current.size
  };
}