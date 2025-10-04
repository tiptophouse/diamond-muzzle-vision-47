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
  
  const cacheVersion = useRef(1);
  const { ttl = 3600000, compression = false } = options; // Default 1 hour TTL

  // Compress data if needed
  const compressData = useCallback((data: string): string => {
    if (!compression || data.length < 100) return data;
    
    try {
      // Simple RLE compression for repeated patterns
      return data.replace(/(.)\1{2,}/g, (match, char) => {
        return `${char}${match.length}`;
      });
    } catch {
      return data;
    }
  }, [compression]);

  // Decompress data
  const decompressData = useCallback((data: string): string => {
    if (!compression) return data;
    
    try {
      // Reverse RLE compression
      return data.replace(/(.)\d+/g, (match, char, count) => {
        return char.repeat(parseInt(count, 10));
      });
    } catch {
      return data;
    }
  }, [compression]);

  // Save data to cloud
  const save = useCallback(async (value: T): Promise<boolean> => {
    try {
      const cacheData: CachedData<T> = {
        value,
        timestamp: Date.now(),
        version: cacheVersion.current,
      };

      let serialized = JSON.stringify(cacheData);
      serialized = compressData(serialized);

      const success = await cloudStorage.setItem(key, serialized);
      
      if (success) {
        setData(value);
        setLastSync(new Date());
        setError(null);
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save to cloud');
      setError(error);
      console.error('CloudStorage save error:', error);
      return false;
    }
  }, [key, cloudStorage, compressData]);

  // Load data from cloud
  const load = useCallback(async (): Promise<T | null> => {
    if (!isInitialized) return null;

    setIsLoading(true);
    setError(null);

    try {
      let serialized = await cloudStorage.getItem(key);
      
      if (!serialized) {
        setData(null);
        setIsLoading(false);
        return null;
      }

      serialized = decompressData(serialized);
      const cached: CachedData<T> = JSON.parse(serialized);

      // Check TTL
      const isExpired = ttl && (Date.now() - cached.timestamp) > ttl;
      if (isExpired) {
        console.log('Cache expired, removing:', key);
        await cloudStorage.removeItem(key);
        setData(null);
        setIsLoading(false);
        return null;
      }

      // Check version
      if (cached.version !== cacheVersion.current) {
        console.log('Cache version mismatch, removing:', key);
        await cloudStorage.removeItem(key);
        setData(null);
        setIsLoading(false);
        return null;
      }

      setData(cached.value);
      setLastSync(new Date(cached.timestamp));
      setIsLoading(false);
      return cached.value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load from cloud');
      setError(error);
      console.error('CloudStorage load error:', error);
      setIsLoading(false);
      return null;
    }
  }, [key, cloudStorage, isInitialized, ttl, decompressData]);

  // Remove data from cloud
  const remove = useCallback(async (): Promise<boolean> => {
    try {
      const success = await cloudStorage.removeItem(key);
      if (success) {
        setData(null);
        setLastSync(null);
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

  // Refresh data from cloud
  const refresh = useCallback(async (): Promise<T | null> => {
    return await load();
  }, [load]);

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

      const cached: CachedData<T> = JSON.parse(decompressData(serialized));
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
  }, [key, cloudStorage, ttl, decompressData]);

  // Auto-load on mount
  useEffect(() => {
    if (isInitialized) {
      load();
    }
  }, [isInitialized, load]);

  return {
    data,
    isLoading,
    error,
    lastSync,
    save,
    load,
    remove,
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
