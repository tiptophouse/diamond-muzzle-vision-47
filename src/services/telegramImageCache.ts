import { telegramSDK } from './TelegramMiniAppSDK';

interface CachedImage {
  url: string;
  timestamp: number;
  base64?: string;
  contentType?: string;
}

class TelegramImageCache {
  private readonly CACHE_PREFIX = 'img_cache_';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 50; // Maximum cached images
  
  async getCachedImage(stockNumber: string): Promise<string | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${stockNumber}`;
      const cached = await telegramSDK.cloudStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const parsedCache: CachedImage = JSON.parse(cached);
      const isExpired = Date.now() - parsedCache.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        await telegramSDK.cloudStorage.removeItem(cacheKey);
        return null;
      }
      
      return parsedCache.base64 || parsedCache.url;
    } catch (error) {
      console.warn('Failed to get cached image:', error);
      return null;
    }
  }

  async cacheImage(stockNumber: string, imageUrl: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${stockNumber}`;
      
      // Convert image to base64 for better caching
      const base64Image = await this.imageToBase64(imageUrl);
      
      const cacheData: CachedImage = {
        url: imageUrl,
        timestamp: Date.now(),
        base64: base64Image,
        contentType: 'image/jpeg'
      };
      
      await telegramSDK.cloudStorage.setItem(cacheKey, JSON.stringify(cacheData));
      await this.cleanupOldCache();
      
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }

  private async imageToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  async prefetchImages(stockNumbers: string[], imageUrls: string[]): Promise<void> {
    if (!telegramSDK.isInitialized()) return;
    
    const prefetchPromises = stockNumbers.map(async (stockNumber, index) => {
      const imageUrl = imageUrls[index];
      if (!imageUrl) return;
      
      const cached = await this.getCachedImage(stockNumber);
      if (!cached) {
        await this.cacheImage(stockNumber, imageUrl);
      }
    });
    
    // Process in batches to avoid overwhelming
    const batchSize = 5;
    for (let i = 0; i < prefetchPromises.length; i += batchSize) {
      const batch = prefetchPromises.slice(i, i + batchSize);
      await Promise.allSettled(batch);
      
      // Add small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async cleanupOldCache(): Promise<void> {
    try {
      const keys = await telegramSDK.cloudStorage.getKeys();
      const imageKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (imageKeys.length <= this.MAX_CACHE_SIZE) return;
      
      // Get all cached items with timestamps
      const cacheItems = await Promise.all(
        imageKeys.map(async (key) => {
          const data = await telegramSDK.cloudStorage.getItem(key);
          if (!data) return null;
          
          try {
            const parsed: CachedImage = JSON.parse(data);
            return { key, timestamp: parsed.timestamp };
          } catch {
            return { key, timestamp: 0 };
          }
        })
      );
      
      // Sort by timestamp (oldest first)
      const validItems = cacheItems.filter(item => item !== null);
      validItems.sort((a, b) => a!.timestamp - b!.timestamp);
      
      // Remove oldest items
      const itemsToRemove = validItems.slice(0, validItems.length - this.MAX_CACHE_SIZE);
      await Promise.all(
        itemsToRemove.map(item => 
          item ? telegramSDK.cloudStorage.removeItem(item.key) : Promise.resolve()
        )
      );
      
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await telegramSDK.cloudStorage.getKeys();
      const imageKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      await Promise.all(
        imageKeys.map(key => telegramSDK.cloudStorage.removeItem(key))
      );
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  async getCacheStats(): Promise<{ count: number; totalSize: string }> {
    try {
      const keys = await telegramSDK.cloudStorage.getKeys();
      const imageKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      return {
        count: imageKeys.length,
        totalSize: `~${Math.round(imageKeys.length * 0.1)}MB`
      };
    } catch (error) {
      return { count: 0, totalSize: '0MB' };
    }
  }
}

export const telegramImageCache = new TelegramImageCache();
export default telegramImageCache;