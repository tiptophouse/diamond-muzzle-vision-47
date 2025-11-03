interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Simple in-memory API cache for reducing redundant requests
 * Automatically expires entries based on TTL
 */
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  get size(): number {
    return this.cache.size;
  }
}

export const apiCache = new ApiCache();

/**
 * Cached API call wrapper
 * @param key - Cache key (use a descriptive string)
 * @param apiCall - Function that returns a Promise with the API data
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 */
export async function cachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const cached = apiCache.get<T>(key);
  
  if (cached !== null) {
    console.log(`📦 Cache hit for: ${key}`);
    return cached;
  }
  
  console.log(`🌐 Cache miss, fetching: ${key}`);
  const data = await apiCall();
  apiCache.set(key, data, ttl);
  
  return data;
}
