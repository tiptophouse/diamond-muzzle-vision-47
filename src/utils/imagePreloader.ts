// Image preloading utility for optimal loading performance

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  format?: 'webp' | 'avif' | 'auto';
  quality?: number;
  sizes?: string;
}

class ImagePreloader {
  private preloadedImages = new Set<string>();
  private preloadQueue: Array<{ url: string; options: PreloadOptions }> = [];
  private isProcessing = false;
  
  // Preload a single image
  async preload(url: string, options: PreloadOptions = {}): Promise<boolean> {
    if (this.preloadedImages.has(url)) {
      return true; // Already preloaded
    }
    
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.optimizeUrl(url, options);
      
      if (options.sizes) {
        link.setAttribute('imagesizes', options.sizes);
      }
      
      // Set fetchpriority based on priority
      if (options.priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      } else if (options.priority === 'low') {
        link.setAttribute('fetchpriority', 'low');
      }
      
      link.onload = () => {
        this.preloadedImages.add(url);
        resolve(true);
      };
      
      link.onerror = () => {
        resolve(false);
      };
      
      document.head.appendChild(link);
      
      // Clean up after a delay
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 10000);
    });
  }
  
  // Preload multiple images with queue management
  preloadBatch(urls: string[], options: PreloadOptions = {}): void {
    urls.forEach(url => {
      if (!this.preloadedImages.has(url)) {
        this.preloadQueue.push({ url, options });
      }
    });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  // Process preload queue with rate limiting
  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    
    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, 3); // Process 3 at a time
      
      await Promise.all(
        batch.map(({ url, options }) => this.preload(url, options))
      );
      
      // Small delay between batches to prevent overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessing = false;
  }
  
  // Preload images that are likely to be needed next
  preloadNext(currentIndex: number, items: Array<{ imageUrl?: string; gem360Url?: string }>, count = 3): void {
    const toPreload: string[] = [];
    
    for (let i = 1; i <= count; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < items.length) {
        const item = items[nextIndex];
        if (item.gem360Url) {
          toPreload.push(item.gem360Url);
        } else if (item.imageUrl) {
          toPreload.push(item.imageUrl);
        }
      }
    }
    
    if (toPreload.length > 0) {
      this.preloadBatch(toPreload, { priority: 'low' });
    }
  }
  
  // Preload critical above-the-fold images
  preloadCritical(urls: string[]): void {
    urls.slice(0, 6).forEach(url => {
      this.preload(url, { priority: 'high', format: 'auto' });
    });
  }
  
  // Clear preload cache
  clear(): void {
    this.preloadedImages.clear();
    this.preloadQueue = [];
  }
  
  // Check if image is preloaded
  isPreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }
  
  // Optimize URL with format and quality parameters
  private optimizeUrl(url: string, options: PreloadOptions): string {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      // Add format optimization
      if (options.format === 'auto') {
        if (this.supportsWebP()) {
          params.set('format', 'webp');
        } else if (this.supportsAVIF()) {
          params.set('format', 'avif');
        }
      } else if (options.format) {
        params.set('format', options.format);
      }
      
      // Add quality optimization
      if (options.quality && options.quality < 100) {
        params.set('q', options.quality.toString());
      }
      
      urlObj.search = params.toString();
      return urlObj.toString();
    } catch (error) {
      return url;
    }
  }
  
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  
  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }
}

// Global preloader instance
export const imagePreloader = new ImagePreloader();

// Preload strategy for diamond store
export const preloadDiamondImages = (diamonds: Array<{ imageUrl?: string; gem360Url?: string }>, visibleIndex = 0) => {
  // Preload critical images (first 6)
  const criticalUrls = diamonds.slice(0, 6).map(d => d.gem360Url || d.imageUrl).filter(Boolean) as string[];
  imagePreloader.preloadCritical(criticalUrls);
  
  // Preload next batch based on current view
  imagePreloader.preloadNext(visibleIndex, diamonds, 6);
};

// Memory cleanup for Telegram environment
export const cleanupImageMemory = () => {
  imagePreloader.clear();
  
  // Force garbage collection if available (development)
  if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
    try {
      (window as any).gc();
    } catch (e) {
      // Ignore errors
    }
  }
};