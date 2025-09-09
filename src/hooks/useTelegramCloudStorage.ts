import { useState, useEffect, useCallback } from 'react';
import { useAdvancedTelegramSDK } from './useAdvancedTelegramSDK';

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  persist?: boolean; // Whether to persist in cloud storage
}

interface CachedItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export function useTelegramCloudStorage() {
  const { cloudStorage, isReady } = useAdvancedTelegramSDK();
  const [cache, setCache] = useState(new Map<string, CachedItem<any>>());
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
    efficiency: 0
  });

  // Cache management with intelligent eviction
  const set = useCallback(async <T>(
    key: string, 
    value: T, 
    config: CacheConfig = {}
  ): Promise<void> => {
    const { ttl = 5 * 60 * 1000, maxSize = 100, persist = true } = config;
    
    try {
      const item: CachedItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        hits: 0
      };

      // Update local cache
      setCache(prev => {
        const newCache = new Map(prev);
        
        // Evict old items if cache is too large
        if (newCache.size >= maxSize) {
          const sortedEntries = Array.from(newCache.entries())
            .sort((a, b) => a[1].hits - b[1].hits); // LRU eviction
          
          const toRemove = sortedEntries.slice(0, Math.floor(maxSize * 0.2));
          toRemove.forEach(([k]) => newCache.delete(k));
        }
        
        newCache.set(key, item);
        return newCache;
      });

      // Persist to cloud storage if enabled
      if (persist && isReady) {
        await cloudStorage.set(`cache_${key}`, item);
      }

      setStats(prev => ({ ...prev, size: cache.size + 1 }));
      console.log('📦 Cache: Stored', key, 'TTL:', ttl);
      
    } catch (error) {
      console.error('❌ Cache: Failed to store', key, error);
    }
  }, [cloudStorage, isReady, cache.size]);

  const get = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      // Check local cache first
      const cached = cache.get(key);
      
      if (cached) {
        const isExpired = Date.now() - cached.timestamp > cached.ttl;
        
        if (!isExpired) {
          // Update hit count
          cached.hits++;
          setStats(prev => ({ 
            ...prev, 
            hits: prev.hits + 1,
            efficiency: (prev.hits + 1) / (prev.hits + prev.misses + 1) * 100
          }));
          
          console.log('⚡ Cache: Hit', key, 'hits:', cached.hits);
          return cached.data;
        } else {
          // Remove expired item
          setCache(prev => {
            const newCache = new Map(prev);
            newCache.delete(key);
            return newCache;
          });
        }
      }

      // Try cloud storage fallback
      if (isReady) {
        const cloudData = await cloudStorage.get(`cache_${key}`);
        if (cloudData && Date.now() - cloudData.timestamp <= cloudData.ttl) {
          // Restore to local cache
          setCache(prev => new Map(prev).set(key, cloudData));
          
          setStats(prev => ({ 
            ...prev, 
            hits: prev.hits + 1,
            efficiency: (prev.hits + 1) / (prev.hits + prev.misses + 1) * 100
          }));
          
          console.log('☁️ Cache: Cloud hit', key);
          return cloudData.data;
        }
      }

      // Cache miss
      setStats(prev => ({ 
        ...prev, 
        misses: prev.misses + 1,
        efficiency: prev.hits / (prev.hits + prev.misses + 1) * 100
      }));
      
      console.log('❌ Cache: Miss', key);
      return null;
      
    } catch (error) {
      console.error('❌ Cache: Failed to get', key, error);
      return null;
    }
  }, [cache, cloudStorage, isReady]);

  const remove = useCallback(async (key: string): Promise<void> => {
    try {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });

      if (isReady) {
        await cloudStorage.remove(`cache_${key}`);
      }

      setStats(prev => ({ ...prev, size: Math.max(0, prev.size - 1) }));
      console.log('🗑️ Cache: Removed', key);
      
    } catch (error) {
      console.error('❌ Cache: Failed to remove', key, error);
    }
  }, [cloudStorage, isReady]);

  const clear = useCallback(async (): Promise<void> => {
    try {
      setCache(new Map());
      
      if (isReady) {
        await cloudStorage.clear();
      }

      setStats({ hits: 0, misses: 0, size: 0, efficiency: 0 });
      console.log('🧹 Cache: Cleared all');
      
    } catch (error) {
      console.error('❌ Cache: Failed to clear', error);
    }
  }, [cloudStorage, isReady]);

  const preload = useCallback(async <T>(
    key: string, 
    fetcher: () => Promise<T>,
    config?: CacheConfig
  ): Promise<T> => {
    // Check cache first
    const cached = await get<T>(key);
    if (cached) {
      return cached;
    }

    // Fetch and cache
    const data = await fetcher();
    await set(key, data, config);
    return data;
  }, [get, set]);

  // Automatic cleanup of expired items
  useEffect(() => {
    const cleanup = setInterval(() => {
      setCache(prev => {
        const newCache = new Map();
        const now = Date.now();
        
        for (const [key, item] of prev.entries()) {
          if (now - item.timestamp <= item.ttl) {
            newCache.set(key, item);
          }
        }
        
        if (newCache.size !== prev.size) {
          console.log('🧹 Cache: Cleaned up', prev.size - newCache.size, 'expired items');
          setStats(s => ({ ...s, size: newCache.size }));
        }
        
        return newCache;
      });
    }, 60000); // Cleanup every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    set,
    get,
    remove,
    clear,
    preload,
    stats,
    isReady
  };
}