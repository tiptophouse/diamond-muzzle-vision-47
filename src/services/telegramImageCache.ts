
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface CacheMetadata {
  timestamp: number;
  diamondId: string;
  originalUrl: string;
  size: number;
  expiresAt: number;
}

interface CacheStats {
  totalItems: number;
  totalSize: number;
  hitRate: number;
  lastCleanup: number;
}

class TelegramImageCache {
  private static instance: TelegramImageCache;
  private webApp: any;
  private cacheStats: CacheStats = {
    totalItems: 0,
    totalSize: 0,
    hitRate: 0,
    lastCleanup: Date.now()
  };
  private hitCount = 0;
  private requestCount = 0;

  private constructor() {
    // Will be initialized when webApp is available
  }

  static getInstance(): TelegramImageCache {
    if (!TelegramImageCache.instance) {
      TelegramImageCache.instance = new TelegramImageCache();
    }
    return TelegramImageCache.instance;
  }

  setWebApp(webApp: any) {
    this.webApp = webApp;
  }

  private getCacheKey(diamondId: string): string {
    return `diamond_image_${diamondId}`;
  }

  private getMetadataKey(diamondId: string): string {
    return `diamond_meta_${diamondId}`;
  }

  private async compressImage(imageBlob: Blob, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxWidth = 400; // Optimize for mobile display
        const maxHeight = 400;
        
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(imageBlob);
    });
  }

  async cacheImage(imageUrl: string, diamondId: string): Promise<boolean> {
    if (!this.webApp?.CloudStorage) {
      console.warn('CloudStorage not available');
      return false;
    }

    try {
      // Check if already cached and not expired
      const existing = await this.getCachedImage(diamondId);
      if (existing) {
        return true;
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      const compressedDataUrl = await this.compressImage(blob, 0.7);
      
      // Create metadata
      const metadata: CacheMetadata = {
        timestamp: Date.now(),
        diamondId,
        originalUrl: imageUrl,
        size: compressedDataUrl.length,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      };

      // Store image and metadata
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          this.webApp.CloudStorage.setItem(
            this.getCacheKey(diamondId),
            compressedDataUrl,
            (error: any) => error ? reject(error) : resolve()
          );
        }),
        new Promise<void>((resolve, reject) => {
          this.webApp.CloudStorage.setItem(
            this.getMetadataKey(diamondId),
            JSON.stringify(metadata),
            (error: any) => error ? reject(error) : resolve()
          );
        })
      ]);

      this.updateStats(metadata.size, true);
      console.log('✅ Image cached successfully:', diamondId);
      return true;

    } catch (error) {
      console.error('❌ Failed to cache image:', error);
      return false;
    }
  }

  async getCachedImage(diamondId: string): Promise<string | null> {
    if (!this.webApp?.CloudStorage) {
      return null;
    }

    this.requestCount++;

    try {
      const [imageData, metadataStr] = await Promise.all([
        new Promise<string | null>((resolve) => {
          this.webApp.CloudStorage.getItem(
            this.getCacheKey(diamondId),
            (error: any, result: string) => {
              resolve(error ? null : result);
            }
          );
        }),
        new Promise<string | null>((resolve) => {
          this.webApp.CloudStorage.getItem(
            this.getMetadataKey(diamondId),
            (error: any, result: string) => {
              resolve(error ? null : result);
            }
          );
        })
      ]);

      if (!imageData || !metadataStr) {
        return null;
      }

      const metadata: CacheMetadata = JSON.parse(metadataStr);
      
      // Check if expired
      if (metadata.expiresAt < Date.now()) {
        this.clearCachedImage(diamondId);
        return null;
      }

      this.hitCount++;
      this.updateHitRate();
      
      console.log('✅ Cache hit for diamond:', diamondId);
      return imageData;

    } catch (error) {
      console.error('❌ Failed to get cached image:', error);
      return null;
    }
  }

  async clearCachedImage(diamondId: string): Promise<void> {
    if (!this.webApp?.CloudStorage) {
      return;
    }

    try {
      await Promise.all([
        new Promise<void>((resolve) => {
          this.webApp.CloudStorage.removeItem(
            this.getCacheKey(diamondId),
            () => resolve()
          );
        }),
        new Promise<void>((resolve) => {
          this.webApp.CloudStorage.removeItem(
            this.getMetadataKey(diamondId),
            () => resolve()
          );
        })
      ]);

      console.log('🗑️ Cleared cache for diamond:', diamondId);
    } catch (error) {
      console.error('❌ Failed to clear cached image:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    if (!this.webApp?.CloudStorage) {
      return;
    }

    try {
      // Get all keys and remove diamond-related ones
      const keys = await new Promise<string[]>((resolve) => {
        this.webApp.CloudStorage.getKeys((error: any, keys: string[]) => {
          resolve(error ? [] : keys);
        });
      });

      const diamondKeys = keys.filter(key => 
        key.startsWith('diamond_image_') || key.startsWith('diamond_meta_')
      );

      await Promise.all(
        diamondKeys.map(key => 
          new Promise<void>((resolve) => {
            this.webApp.CloudStorage.removeItem(key, () => resolve());
          })
        )
      );

      this.resetStats();
      console.log('🗑️ Cleared all diamond cache');
    } catch (error) {
      console.error('❌ Failed to clear all cache:', error);
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    if (!this.webApp?.CloudStorage) {
      return this.cacheStats;
    }

    try {
      const keys = await new Promise<string[]>((resolve) => {
        this.webApp.CloudStorage.getKeys((error: any, keys: string[]) => {
          resolve(error ? [] : keys);
        });
      });

      const imageKeys = keys.filter(key => key.startsWith('diamond_image_'));
      this.cacheStats.totalItems = imageKeys.length;

      return this.cacheStats;
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return this.cacheStats;
    }
  }

  private updateStats(sizeChange: number, isAdd: boolean) {
    if (isAdd) {
      this.cacheStats.totalSize += sizeChange;
      this.cacheStats.totalItems++;
    } else {
      this.cacheStats.totalSize -= sizeChange;
      this.cacheStats.totalItems--;
    }
  }

  private updateHitRate() {
    this.cacheStats.hitRate = this.requestCount > 0 ? 
      (this.hitCount / this.requestCount) * 100 : 0;
  }

  private resetStats() {
    this.cacheStats = {
      totalItems: 0,
      totalSize: 0,
      hitRate: 0,
      lastCleanup: Date.now()
    };
    this.hitCount = 0;
    this.requestCount = 0;
  }
}

export const telegramImageCache = TelegramImageCache.getInstance();
