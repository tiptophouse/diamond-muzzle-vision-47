
interface CachedUserDiamondCount {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
  diamond_count: number;
  last_upload?: string;
  status: 'active' | 'inactive';
  cached_at: string;
}

interface DiamondCountStats {
  totalUsers: number;
  usersWithDiamonds: number;
  usersWithZeroDiamonds: number;
  totalDiamonds: number;
  avgDiamondsPerUser: number;
}

class UserDiamondCountsCache {
  private static instance: UserDiamondCountsCache;
  private cache: CachedUserDiamondCount[] = [];
  private stats: DiamondCountStats | null = null;
  private lastUpdated: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): UserDiamondCountsCache {
    if (!UserDiamondCountsCache.instance) {
      UserDiamondCountsCache.instance = new UserDiamondCountsCache();
    }
    return UserDiamondCountsCache.instance;
  }

  isCacheValid(): boolean {
    if (!this.lastUpdated) return false;
    return Date.now() - this.lastUpdated.getTime() < this.CACHE_DURATION;
  }

  getCachedData(): { userCounts: CachedUserDiamondCount[], stats: DiamondCountStats } | null {
    if (this.isCacheValid() && this.cache.length > 0 && this.stats) {
      console.log('📊 CACHE: Using cached diamond counts', this.cache.length, 'users');
      return { userCounts: this.cache, stats: this.stats };
    }
    return null;
  }

  updateCache(userCounts: CachedUserDiamondCount[], stats: DiamondCountStats): void {
    this.cache = userCounts.map(user => ({
      ...user,
      cached_at: new Date().toISOString()
    }));
    this.stats = stats;
    this.lastUpdated = new Date();
    
    console.log('📊 CACHE: Updated cache with', userCounts.length, 'users');
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('user_diamond_counts_cache', JSON.stringify({
        userCounts: this.cache,
        stats: this.stats,
        lastUpdated: this.lastUpdated.toISOString()
      }));
    } catch (error) {
      console.warn('📊 CACHE: Failed to save to localStorage:', error);
    }
  }

  loadFromLocalStorage(): void {
    try {
      const cached = localStorage.getItem('user_diamond_counts_cache');
      if (cached) {
        const data = JSON.parse(cached);
        this.cache = data.userCounts || [];
        this.stats = data.stats || null;
        this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null;
        
        if (this.isCacheValid()) {
          console.log('📊 CACHE: Loaded valid cache from localStorage');
        } else {
          console.log('📊 CACHE: Cache expired, will reload');
          this.clearCache();
        }
      }
    } catch (error) {
      console.warn('📊 CACHE: Failed to load from localStorage:', error);
    }
  }

  clearCache(): void {
    this.cache = [];
    this.stats = null;
    this.lastUpdated = null;
    localStorage.removeItem('user_diamond_counts_cache');
    console.log('📊 CACHE: Cache cleared');
  }

  updateUserDiamondCount(telegramId: number, newCount: number): void {
    const userIndex = this.cache.findIndex(user => user.telegram_id === telegramId);
    if (userIndex !== -1) {
      const oldCount = this.cache[userIndex].diamond_count;
      this.cache[userIndex].diamond_count = newCount;
      this.cache[userIndex].cached_at = new Date().toISOString();
      
      // Update stats
      if (this.stats) {
        this.stats.totalDiamonds = this.stats.totalDiamonds - oldCount + newCount;
        if (oldCount === 0 && newCount > 0) {
          this.stats.usersWithDiamonds++;
          this.stats.usersWithZeroDiamonds--;
        } else if (oldCount > 0 && newCount === 0) {
          this.stats.usersWithDiamonds--;
          this.stats.usersWithZeroDiamonds++;
        }
        this.stats.avgDiamondsPerUser = this.stats.totalUsers > 0 ? 
          Math.round((this.stats.totalDiamonds / this.stats.totalUsers) * 10) / 10 : 0;
      }
      
      console.log(`📊 CACHE: Updated user ${telegramId} diamond count: ${oldCount} -> ${newCount}`);
    }
  }

  getCacheInfo(): { isValid: boolean, lastUpdated: Date | null, userCount: number } {
    return {
      isValid: this.isCacheValid(),
      lastUpdated: this.lastUpdated,
      userCount: this.cache.length
    };
  }
}

export const userDiamondCountsCache = UserDiamondCountsCache.getInstance();
