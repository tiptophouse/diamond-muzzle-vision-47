/**
 * Telegram CloudStorage Hook with Advanced Caching
 * Leverages Telegram's native CloudStorage for persistent, cross-device data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTelegramAdvanced } from './useTelegramAdvanced';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  compression?: boolean; // Compress large data
  syncAcrossDevices?: boolean; // Default true with CloudStorage
  backgroundRefresh?: boolean; // Enable background refresh
}

interface CachedData<T> {
  value: T;
  timestamp: number;
  version: number;
}

export function useTelegramCloudCache<T = any>(
  key: string,
  options: CacheOptions = {}
) {
  const { cloudStorage, isInitialized } = useTelegramAdvanced();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isFresh, setIsFresh] = useState(false); // True if data is from valid cache
  const [isRefreshing, setIsRefreshing] = useState(false); // True during background refresh
  
  const cacheVersion = useRef(1);
  const { ttl = 3600000, compression = false, backgroundRefresh = false } = options; // Default 1 hour TTL

  // Compress data if needed (disabled - CloudStorage handles efficiently)
  const compressData = useCallback((data: string): string => {
    // CloudStorage is already optimized, no need for custom compression
    return data;
  }, []);

  // Decompress data (disabled - CloudStorage handles efficiently)
  const decompressData = useCallback((data: string): string => {
    // CloudStorage is already optimized, no need for custom decompression
    return data;
  }, []);

  // Save data to cloud
  const save = useCallback(async (value: T): Promise<boolean> => {
    try {
      const cacheData: CachedData<T> = {
        value,
        timestamp: Date.now(),
        version: cacheVersion.current,
      };

      const serialized = JSON.stringify(cacheData);
      console.log('💾 CloudCache: Saving to key:', key, 'size:', serialized.length, 'items:', Array.isArray(value) ? value.length : 'N/A');

      const success = await cloudStorage.setItem(key, serialized);
      
      if (success) {
        console.log('✅ CloudCache: Successfully saved to key:', key);
        setData(value);
        setLastSync(new Date());
        setIsFresh(true);
        setError(null);
      } else {
        console.error('❌ CloudCache: Failed to save to key:', key);
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save to cloud');
      setError(error);
      console.error('❌ CloudCache: Save error for key:', key, error);
      return false;
    }
  }, [key, cloudStorage]);

  // Load data from cloud
  const load = useCallback(async (): Promise<T | null> => {
    if (!isInitialized) {
      console.log('⏳ CloudCache: Not initialized yet for key:', key);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const serialized = await cloudStorage.getItem(key);
      
      if (!serialized) {
        console.log('📭 CloudCache: No cached data found for key:', key);
        setData(null);
        setIsFresh(false);
        setIsLoading(false);
        return null;
      }

      console.log('📦 CloudCache: Found cached data for key:', key, 'size:', serialized.length);
      const cached: CachedData<T> = JSON.parse(serialized);

      // Check TTL
      const isExpired = ttl && (Date.now() - cached.timestamp) > ttl;
      if (isExpired) {
        console.log('⏰ CloudCache: Cache expired for key:', key);
        await cloudStorage.removeItem(key);
        setData(null);
        setIsFresh(false);
        setIsLoading(false);
        return null;
      }

      // Check version
      if (cached.version !== cacheVersion.current) {
        console.log('🔄 CloudCache: Version mismatch for key:', key);
        await cloudStorage.removeItem(key);
        setData(null);
        setIsFresh(false);
        setIsLoading(false);
        return null;
      }

      console.log('✅ CloudCache: Valid cache loaded for key:', key, 'items:', Array.isArray(cached.value) ? cached.value.length : 'N/A');
      setData(cached.value);
      setLastSync(new Date(cached.timestamp));
      setIsFresh(true);
      setIsLoading(false);
      return cached.value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load from cloud');
      setError(error);
      console.error('❌ CloudCache: Load error for key:', key, error);
      setIsFresh(false);
      setIsLoading(false);
      return null;
    }
  }, [key, cloudStorage, isInitialized, ttl]);

  // Remove data from cloud (alias for backward compatibility)
  const remove = useCallback(async (): Promise<boolean> => {
    try {
      const success = await cloudStorage.removeItem(key);
      if (success) {
        setData(null);
        setLastSync(null);
        setIsFresh(false);
        setError(null);
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove from cloud');
      setError(error);
      console.error('CloudStorage remove error:', error);
      return false;
    }
  }, [key, cloudStorage]);

  // Clear cache (same as remove, for consistency)
  const clear = remove;

  // Refresh data from cloud with background refresh support
  const refresh = useCallback(async (fetchFn?: () => Promise<T>): Promise<T | null> => {
    if (fetchFn && backgroundRefresh) {
      setIsRefreshing(true);
      try {
        const freshData = await fetchFn();
        await save(freshData);
        setIsRefreshing(false);
        return freshData;
      } catch (err) {
        console.error('Background refresh failed:', err);
        setIsRefreshing(false);
        return data;
      }
    }
    
    return await load();
  }, [load, save, backgroundRefresh, data]);

  // Check if data exists
  const exists = useCallback(async (): Promise<boolean> => {
    try {
      const value = await cloudStorage.getItem(key);
      return value !== null;
    } catch {
      return false;
    }
  }, [key, cloudStorage]);

  // Get cache info
  const getInfo = useCallback(async (): Promise<{
    exists: boolean;
    timestamp: number | null;
    isExpired: boolean;
    size: number | null;
  }> => {
    try {
      const serialized = await cloudStorage.getItem(key);
      
      if (!serialized) {
        return { exists: false, timestamp: null, isExpired: false, size: null };
      }

      const cached: CachedData<T> = JSON.parse(serialized);
      const isExpired = ttl && (Date.now() - cached.timestamp) > ttl;

      return {
        exists: true,
        timestamp: cached.timestamp,
        isExpired: !!isExpired,
        size: serialized.length,
      };
    } catch {
      return { exists: false, timestamp: null, isExpired: false, size: null };
    }
  }, [key, cloudStorage, ttl]);

  // Auto-load on mount (fixed dependency)
  useEffect(() => {
    if (isInitialized) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]); // Only re-run when isInitialized changes

  return {
    data,
    isLoading,
    isFresh,
    isRefreshing,
    error,
    lastSync,
    save,
    load,
    remove,
    clear,
    refresh,
    exists,
    getInfo,
    isCloudStorageAvailable: isInitialized,
  };
}

// Batch operations hook
export function useTelegramCloudBatch() {
  const { cloudStorage, isInitialized } = useTelegramAdvanced();

  const saveMultiple = useCallback(async (items: Record<string, any>): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      const serialized: Record<string, string> = {};
      for (const [key, value] of Object.entries(items)) {
        serialized[key] = JSON.stringify({
          value,
          timestamp: Date.now(),
        });
      }

      return await cloudStorage.setItems(serialized);
    } catch (error) {
      console.error('Batch save error:', error);
      return false;
    }
  }, [cloudStorage, isInitialized]);

  const loadMultiple = useCallback(async (keys: string[]): Promise<Record<string, any>> => {
    if (!isInitialized) return {};

    try {
      const items = await cloudStorage.getItems(keys);
      const result: Record<string, any> = {};

      for (const [key, value] of Object.entries(items)) {
        if (value) {
          try {
            const parsed = JSON.parse(value);
            result[key] = parsed.value;
          } catch {
            result[key] = null;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Batch load error:', error);
      return {};
    }
  }, [cloudStorage, isInitialized]);

  const removeMultiple = useCallback(async (keys: string[]): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      return await cloudStorage.removeItems(keys);
    } catch (error) {
      console.error('Batch remove error:', error);
      return false;
    }
  }, [cloudStorage, isInitialized]);

  const getAllKeys = useCallback(async (): Promise<string[]> => {
    if (!isInitialized) return [];

    try {
      return await cloudStorage.getKeys();
    } catch (error) {
      console.error('Get keys error:', error);
      return [];
    }
  }, [cloudStorage, isInitialized]);

  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      const keys = await getAllKeys();
      if (keys.length === 0) return true;
      return await removeMultiple(keys);
    } catch (error) {
      console.error('Clear all error:', error);
      return false;
    }
  }, [isInitialized, getAllKeys, removeMultiple]);

  return {
    saveMultiple,
    loadMultiple,
    removeMultiple,
    getAllKeys,
    clearAll,
    isAvailable: isInitialized,
  };
}
