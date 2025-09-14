import { telegramSDK } from './TelegramMiniAppSDK';
import { Diamond } from "@/components/inventory/InventoryTable";

interface CachedInventoryData {
  data: Diamond[];
  timestamp: number;
  totalCount: number;
  userId: number;
  version: string;
}

interface InventoryChunk {
  chunk: Diamond[];
  chunkId: number;
  totalChunks: number;
  timestamp: number;
  userId: number;
}

class TelegramInventoryCache {
  private readonly CACHE_PREFIX = 'inv_cache_';
  private readonly CHUNK_PREFIX = 'inv_chunk_';
  private readonly META_PREFIX = 'inv_meta_';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly CHUNK_SIZE = 100; // 100 stones per chunk for large datasets
  private readonly MAX_CACHE_SIZE = 20; // Maximum cached inventories

  async getCachedInventory(userId: number): Promise<Diamond[] | null> {
    try {
      if (!telegramSDK.isInitialized()) {
        console.warn('📱 Telegram SDK not initialized, using localStorage fallback');
        return this.getLocalStorageFallback();
      }

      const metaKey = `${this.META_PREFIX}${userId}`;
      const cachedMeta = await telegramSDK.cloudStorage.getItem(metaKey);
      
      if (!cachedMeta) {
        console.log('📱 No cached inventory metadata found for user:', userId);
        return null;
      }

      const metaData: { totalChunks: number; timestamp: number; totalCount: number } = JSON.parse(cachedMeta);
      const isExpired = Date.now() - metaData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        console.log('📱 Cached inventory expired, cleaning up...');
        await this.clearCachedInventory(userId);
        return null;
      }

      // For large datasets, load chunks progressively
      if (metaData.totalCount > 1000) {
        console.log('📱 Loading large dataset in chunks...');
        return await this.loadChunkedInventory(userId, metaData.totalChunks);
      } else {
        // For smaller datasets, load normally
        const cacheKey = `${this.CACHE_PREFIX}${userId}`;
        const cached = await telegramSDK.cloudStorage.getItem(cacheKey);
        
        if (!cached) return null;
        
        const parsedCache: CachedInventoryData = JSON.parse(cached);
        console.log('📱 Retrieved cached inventory:', parsedCache.data.length, 'stones');
        return parsedCache.data;
      }
    } catch (error) {
      console.warn('📱 Failed to get cached inventory:', error);
      return this.getLocalStorageFallback();
    }
  }

  async cacheInventory(userId: number, data: Diamond[]): Promise<void> {
    try {
      if (!telegramSDK.isInitialized()) {
        console.warn('📱 Telegram SDK not initialized, using localStorage fallback');
        this.setLocalStorageFallback(data);
        return;
      }

      console.log('📱 Caching inventory for user:', userId, 'with', data.length, 'stones');

      // For datasets over 1000 stones, use chunked storage
      if (data.length > 1000) {
        await this.cacheInventoryChunked(userId, data);
      } else {
        await this.cacheInventoryDirect(userId, data);
      }

      await this.cleanupOldCache();
    } catch (error) {
      console.warn('📱 Failed to cache inventory:', error);
      this.setLocalStorageFallback(data);
    }
  }

  private async cacheInventoryChunked(userId: number, data: Diamond[]): Promise<void> {
    const chunks = this.chunkArray(data, this.CHUNK_SIZE);
    const totalChunks = chunks.length;
    const timestamp = Date.now();

    console.log('📱 Storing', data.length, 'stones in', totalChunks, 'chunks');

    // Store metadata
    const metaKey = `${this.META_PREFIX}${userId}`;
    const metaData = {
      totalChunks,
      timestamp,
      totalCount: data.length
    };
    await telegramSDK.cloudStorage.setItem(metaKey, JSON.stringify(metaData));

    // Store chunks in parallel (but in batches to avoid overwhelming)
    const batchSize = 3;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const promises = batch.map(async (chunk, batchIndex) => {
        const actualIndex = i + batchIndex;
        const chunkKey = `${this.CHUNK_PREFIX}${userId}_${actualIndex}`;
        const chunkData: InventoryChunk = {
          chunk,
          chunkId: actualIndex,
          totalChunks,
          timestamp,
          userId
        };
        return telegramSDK.cloudStorage.setItem(chunkKey, JSON.stringify(chunkData));
      });
      
      await Promise.allSettled(promises);
      
      // Small delay between batches to prevent rate limiting
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log('📱 Successfully cached', data.length, 'stones in', totalChunks, 'chunks');
  }

  private async cacheInventoryDirect(userId: number, data: Diamond[]): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`;
    const cacheData: CachedInventoryData = {
      data,
      timestamp: Date.now(),
      totalCount: data.length,
      userId,
      version: '1.0'
    };
    
    await telegramSDK.cloudStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('📱 Successfully cached', data.length, 'stones directly');
  }

  private async loadChunkedInventory(userId: number, totalChunks: number): Promise<Diamond[]> {
    const allData: Diamond[] = [];
    
    // Load chunks in parallel but in batches
    const batchSize = 5;
    for (let i = 0; i < totalChunks; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, totalChunks - i) }, (_, batchIndex) => i + batchIndex);
      const promises = batch.map(async (chunkIndex) => {
        const chunkKey = `${this.CHUNK_PREFIX}${userId}_${chunkIndex}`;
        try {
          const chunkData = await telegramSDK.cloudStorage.getItem(chunkKey);
          if (chunkData) {
            const parsed: InventoryChunk = JSON.parse(chunkData);
            return { index: chunkIndex, data: parsed.chunk };
          }
        } catch (error) {
          console.warn(`📱 Failed to load chunk ${chunkIndex}:`, error);
        }
        return null;
      });

      const results = await Promise.allSettled(promises);
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allData.push(...result.value.data);
        }
      });

      // Small delay between batches
      if (i + batchSize < totalChunks) {
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }

    console.log('📱 Loaded', allData.length, 'stones from chunked storage');
    return allData;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async clearCachedInventory(userId: number): Promise<void> {
    try {
      if (!telegramSDK.isInitialized()) return;

      const keys = await telegramSDK.cloudStorage.getKeys();
      const userKeys = keys.filter(key => 
        key.startsWith(`${this.CACHE_PREFIX}${userId}`) ||
        key.startsWith(`${this.CHUNK_PREFIX}${userId}`) ||
        key.startsWith(`${this.META_PREFIX}${userId}`)
      );

      if (userKeys.length > 0) {
        console.log('📱 Clearing', userKeys.length, 'cached inventory items for user:', userId);
        await Promise.allSettled(
          userKeys.map(key => telegramSDK.cloudStorage.removeItem(key))
        );
      }
    } catch (error) {
      console.warn('📱 Failed to clear cached inventory:', error);
    }
  }

  private async cleanupOldCache(): Promise<void> {
    try {
      if (!telegramSDK.isInitialized()) return;

      const keys = await telegramSDK.cloudStorage.getKeys();
      const inventoryKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) || 
        key.startsWith(this.CHUNK_PREFIX) ||
        key.startsWith(this.META_PREFIX)
      );

      if (inventoryKeys.length <= this.MAX_CACHE_SIZE) return;

      // Get timestamps and remove oldest entries
      const cacheItems = await Promise.all(
        inventoryKeys.map(async (key) => {
          try {
            const data = await telegramSDK.cloudStorage.getItem(key);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            return { key, timestamp: parsed.timestamp || 0 };
          } catch {
            return { key, timestamp: 0 };
          }
        })
      );

      const validItems = cacheItems.filter(item => item !== null);
      validItems.sort((a, b) => a!.timestamp - b!.timestamp);

      const itemsToRemove = validItems.slice(0, validItems.length - this.MAX_CACHE_SIZE);
      if (itemsToRemove.length > 0) {
        console.log('📱 Cleaning up', itemsToRemove.length, 'old cached inventories');
        await Promise.allSettled(
          itemsToRemove.map(item => 
            item ? telegramSDK.cloudStorage.removeItem(item.key) : Promise.resolve()
          )
        );
      }
    } catch (error) {
      console.warn('📱 Failed to cleanup inventory cache:', error);
    }
  }

  // Fallback methods for when Telegram SDK is not available
  private getLocalStorageFallback(): Diamond[] | null {
    try {
      const data = localStorage.getItem('diamond_inventory');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setLocalStorageFallback(data: Diamond[]): void {
    try {
      localStorage.setItem('diamond_inventory', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to set localStorage fallback:', error);
    }
  }

  async getCacheStats(): Promise<{ totalKeys: number; inventoryKeys: number; totalSize: string }> {
    try {
      if (!telegramSDK.isInitialized()) {
        return { totalKeys: 0, inventoryKeys: 0, totalSize: '0KB' };
      }

      const keys = await telegramSDK.cloudStorage.getKeys();
      const inventoryKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) || 
        key.startsWith(this.CHUNK_PREFIX) ||
        key.startsWith(this.META_PREFIX)
      );

      return {
        totalKeys: keys.length,
        inventoryKeys: inventoryKeys.length,
        totalSize: `~${Math.round(inventoryKeys.length * 0.2)}KB`
      };
    } catch {
      return { totalKeys: 0, inventoryKeys: 0, totalSize: '0KB' };
    }
  }

  // Method to handle large dataset optimization
  async optimizeForLargeDataset(userId: number, data: Diamond[]): Promise<void> {
    if (data.length > 5000) {
      console.log('📱 Optimizing storage for large dataset:', data.length, 'stones');
      
      // Clear any existing cache first
      await this.clearCachedInventory(userId);
      
      // Cache with chunked storage
      await this.cacheInventoryChunked(userId, data);
      
      console.log('📱 Large dataset optimization complete');
    } else {
      await this.cacheInventory(userId, data);
    }
  }
}

export const telegramInventoryCache = new TelegramInventoryCache();
export default telegramInventoryCache;