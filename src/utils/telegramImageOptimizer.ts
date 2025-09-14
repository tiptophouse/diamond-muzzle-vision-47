/**
 * Telegram Mini App Image Optimization Utilities
 * Based on Telegram WebApp best practices
 */

import { telegramSDK } from '@/services/TelegramMiniAppSDK';

interface TelegramImageCache {
  url: string;
  data: string;
  timestamp: number;
  size: number;
  format: string;
  stockNumber: string;
}

export class TelegramImageOptimizer {
  private static instance: TelegramImageOptimizer;
  private readonly CACHE_PREFIX = 'tg_opt_img_';
  private readonly MAX_CACHE_SIZE = 25; // Conservative for Telegram
  private readonly CACHE_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  private readonly MAX_VIEWPORT_SIZE = 1024;
  private readonly QUALITY_SETTINGS = {
    high: { webp: 85, jpeg: 90 },
    medium: { webp: 75, jpeg: 80 },
    low: { webp: 65, jpeg: 70 }
  };

  private memoryUsage = 0;
  private readonly maxMemory = 40 * 1024 * 1024; // 40MB limit

  static getInstance(): TelegramImageOptimizer {
    if (!TelegramImageOptimizer.instance) {
      TelegramImageOptimizer.instance = new TelegramImageOptimizer();
    }
    return TelegramImageOptimizer.instance;
  }

  /**
   * Optimize image URL for Telegram WebView
   */
  optimizeUrl(originalUrl: string, options: {
    priority?: 'high' | 'medium' | 'low';
    maxWidth?: number;
    format?: 'webp' | 'auto';
  } = {}): string {
    try {
      const { priority = 'medium', maxWidth, format = 'auto' } = options;
      const url = new URL(originalUrl);
      const params = new URLSearchParams(url.search);
      
      // Get optimal dimensions from Telegram viewport
      const webApp = telegramSDK.getWebApp();
      const viewportWidth = webApp?.viewportHeight || window.innerWidth;
      const optimalWidth = Math.min(
        maxWidth || viewportWidth,
        this.MAX_VIEWPORT_SIZE
      );
      
      // Set dimensions
      params.set('width', optimalWidth.toString());
      params.set('height', optimalWidth.toString());
      params.set('fit', 'cover');
      
      // Format optimization - Telegram supports WebP universally
      const targetFormat = format === 'auto' ? 'webp' : format;
      params.set('format', targetFormat);
      
      // Quality based on priority and network
      const quality = this.QUALITY_SETTINGS[priority][targetFormat as keyof typeof this.QUALITY_SETTINGS.high];
      params.set('q', quality.toString());
      
      // Telegram WebView optimizations
      params.set('strip', 'true'); // Remove metadata
      params.set('progressive', 'true');
      params.set('optimize', 'true');
      
      // Network-aware compression
      if (this.isSlowNetwork()) {
        const reducedQuality = Math.max(quality - 15, 50);
        params.set('q', reducedQuality.toString());
      }
      
      url.search = params.toString();
      return url.toString();
    } catch (error) {
      console.warn('URL optimization failed:', error);
      return originalUrl;
    }
  }

  /**
   * Cache image in Telegram CloudStorage with size management
   */
  async cacheImage(stockNumber: string, imageUrl: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<boolean> {
    if (!telegramSDK.isInitialized()) return false;
    
    try {
      const cacheKey = `${this.CACHE_PREFIX}${stockNumber}`;
      
      // Check if already cached
      const existing = await telegramSDK.cloudStorage.getItem(cacheKey);
      if (existing) return true;
      
      // Memory check
      if (this.memoryUsage > this.maxMemory * 0.8) {
        await this.cleanupCache();
      }
      
      // Load and convert image
      const optimizedUrl = this.optimizeUrl(imageUrl, { priority });
      const imageData = await this.imageToBase64(optimizedUrl);
      
      const cacheEntry: TelegramImageCache = {
        url: optimizedUrl,
        data: imageData,
        timestamp: Date.now(),
        size: this.estimateBase64Size(imageData),
        format: 'webp',
        stockNumber
      };
      
      // Store in CloudStorage
      await telegramSDK.cloudStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      this.memoryUsage += cacheEntry.size;
      
      console.log(`📱 Cached image for ${stockNumber}: ${(cacheEntry.size / 1024).toFixed(1)}KB`);
      return true;
      
    } catch (error) {
      console.warn(`Failed to cache image for ${stockNumber}:`, error);
      return false;
    }
  }

  /**
   * Retrieve cached image from CloudStorage
   */
  async getCachedImage(stockNumber: string): Promise<string | null> {
    if (!telegramSDK.isInitialized()) return null;
    
    try {
      const cacheKey = `${this.CACHE_PREFIX}${stockNumber}`;
      const cached = await telegramSDK.cloudStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const cacheEntry: TelegramImageCache = JSON.parse(cached);
      
      // Check expiration
      if (Date.now() - cacheEntry.timestamp > this.CACHE_DURATION) {
        await telegramSDK.cloudStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.warn(`Failed to get cached image for ${stockNumber}:`, error);
      return null;
    }
  }

  /**
   * Batch preload images for smooth scrolling
   */
  async preloadImages(
    items: Array<{ stockNumber: string; imageUrl?: string; gem360Url?: string }>,
    startIndex: number = 0,
    batchSize: number = 3
  ): Promise<void> {
    if (!telegramSDK.isInitialized()) return;
    
    const networkQuality = this.getNetworkQuality();
    if (networkQuality === 'offline') return;
    
    // Adjust batch size based on network
    const adjustedBatchSize = networkQuality === 'slow' ? 2 : batchSize;
    
    const endIndex = Math.min(startIndex + adjustedBatchSize * 3, items.length);
    const itemsToPreload = items.slice(startIndex, endIndex);
    
    for (let i = 0; i < itemsToPreload.length; i += adjustedBatchSize) {
      const batch = itemsToPreload.slice(i, i + adjustedBatchSize);
      
      const promises = batch.map(async (item) => {
        const imageUrl = item.gem360Url || item.imageUrl;
        if (!imageUrl) return;
        
        // Check if already cached
        const cached = await this.getCachedImage(item.stockNumber);
        if (cached) return;
        
        // Cache with low priority for preloading
        return this.cacheImage(item.stockNumber, imageUrl, 'low');
      });
      
      await Promise.allSettled(promises);
      
      // Delay between batches for Telegram WebView
      if (i + adjustedBatchSize < itemsToPreload.length) {
        const delay = networkQuality === 'slow' ? 1000 : 200;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Clear old cached images to free memory
   */
  async cleanupCache(): Promise<void> {
    if (!telegramSDK.isInitialized()) return;
    
    try {
      const keys = await telegramSDK.cloudStorage.getKeys();
      const imageKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (imageKeys.length <= this.MAX_CACHE_SIZE) return;
      
      // Get cache entries with timestamps
      const entries: Array<{ key: string; timestamp: number; size: number }> = [];
      
      for (const key of imageKeys) {
        try {
          const data = await telegramSDK.cloudStorage.getItem(key);
          if (data) {
            const entry: TelegramImageCache = JSON.parse(data);
            entries.push({
              key,
              timestamp: entry.timestamp,
              size: entry.size || 0
            });
          }
        } catch (error) {
          // Remove invalid entries
          await telegramSDK.cloudStorage.removeItem(key);
        }
      }
      
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest entries
      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE + 5);
      let freedMemory = 0;
      
      for (const entry of toRemove) {
        await telegramSDK.cloudStorage.removeItem(entry.key);
        freedMemory += entry.size;
      }
      
      this.memoryUsage = Math.max(0, this.memoryUsage - freedMemory);
      
      console.log(`🧹 Cleaned up ${toRemove.length} cached images, freed ${(freedMemory / 1024).toFixed(1)}KB`);
      
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    count: number;
    totalSize: string;
    hitRate: number;
    networkQuality: string;
  }> {
    try {
      const keys = await telegramSDK.cloudStorage.getKeys();
      const imageKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      return {
        count: imageKeys.length,
        totalSize: `${(this.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
        hitRate: 85, // Estimated
        networkQuality: this.getNetworkQuality()
      };
    } catch (error) {
      return {
        count: 0,
        totalSize: '0MB',
        hitRate: 0,
        networkQuality: 'unknown'
      };
    }
  }

  // Helper methods
  private async imageToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private estimateBase64Size(base64: string): number {
    return Math.ceil(base64.length * 0.75);
  }

  private isSlowNetwork(): boolean {
    const connection = (navigator as any).connection;
    if (!connection) return false;
    
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' || 
           connection.saveData;
  }

  private getNetworkQuality(): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) return 'offline';
    
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'slow';
      }
      if (connection.saveData) return 'slow';
    }
    
    return 'fast';
  }
}

// Global instance
export const telegramImageOptimizer = TelegramImageOptimizer.getInstance();

// Convenience functions
export const optimizeImageUrl = (url: string, options?: Parameters<TelegramImageOptimizer['optimizeUrl']>[1]) => 
  telegramImageOptimizer.optimizeUrl(url, options);

export const preloadDiamondImages = (diamonds: Array<{ stockNumber: string; imageUrl?: string; gem360Url?: string }>, startIndex?: number) =>
  telegramImageOptimizer.preloadImages(diamonds, startIndex);

export const getCachedImage = (stockNumber: string) =>
  telegramImageOptimizer.getCachedImage(stockNumber);

export const clearImageCache = () =>
  telegramImageOptimizer.cleanupCache();