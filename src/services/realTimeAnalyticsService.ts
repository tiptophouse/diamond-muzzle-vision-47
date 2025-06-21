
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from "@/lib/api";

export interface InventoryAnalytics {
  totalDiamonds: number;
  totalValue: number;
  averagePrice: number;
  colorDistribution: Record<string, number>;
  clarityDistribution: Record<string, number>;
  shapeDistribution: Record<string, number>;
  caratRanges: {
    under_1: number;
    '1_to_2': number;
    '2_to_3': number;
    over_3: number;
  };
  priceRanges: {
    under_1000: number;
    '1000_to_5000': number;
    '5000_to_10000': number;
    over_10000: number;
  };
}

export interface UserAnalytics {
  telegram_id: number;
  total_visits: number;
  total_time_spent: string;
  last_active: string;
  subscription_status: string;
  api_calls_count: number;
  lifetime_value: number;
  cost_per_user: number;
  revenue_per_user: number;
  profit_loss: number;
  storage_used_mb: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  currently_active?: boolean;
  current_session_pages?: number;
}

export interface AdminAnalytics {
  users: UserAnalytics[];
  total_users: number;
  active_users: number;
  stats: {
    total_visits: number;
    total_revenue: number;
    total_costs: number;
  };
}

class RealTimeAnalyticsService {
  private cache = new Map<string, { data: any; expires: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getInventoryAnalytics(useCache = true): Promise<InventoryAnalytics | null> {
    const userId = getCurrentUserId() || 2138564172;
    const cacheKey = `inventory_analytics_${userId}`;
    
    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() < cached.expires) {
        console.log('📊 Using cached inventory analytics');
        return cached.data;
      }
    }

    try {
      console.log('📊 Fetching fresh inventory analytics');
      
      const { data: response, error } = await supabase.functions.invoke('diamond-management', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'get_analytics',
          'x-user_id': userId.toString()
        }
      });

      if (error) {
        console.error('❌ Analytics fetch error:', error);
        throw new Error(error.message);
      }

      if (!response?.success) {
        console.error('❌ Analytics operation failed:', response?.error);
        throw new Error(response?.error || 'Analytics fetch failed');
      }

      const analytics = response.data as InventoryAnalytics;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: analytics,
        expires: Date.now() + this.CACHE_TTL
      });

      console.log('✅ Inventory analytics loaded:', analytics.totalDiamonds, 'diamonds');
      return analytics;
      
    } catch (error) {
      console.error('❌ Failed to fetch inventory analytics:', error);
      return null;
    }
  }

  async getUserAnalytics(telegramId?: number): Promise<UserAnalytics | null> {
    const userId = telegramId || getCurrentUserId() || 2138564172;
    const cacheKey = `user_analytics_${userId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() < cached.expires) {
        console.log('📊 Using cached user analytics');
        return cached.data;
      }
    }

    try {
      console.log('📊 Fetching user analytics for:', userId);
      
      const { data: response, error } = await supabase.functions.invoke('user-analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'get_user_stats',
          'x-user_id': userId.toString()
        }
      });

      if (error) {
        console.error('❌ User analytics error:', error);
        throw new Error(error.message);
      }

      if (!response?.success) {
        console.error('❌ User analytics failed:', response?.error);
        throw new Error(response?.error || 'User analytics fetch failed');
      }

      const analytics = response.data.analytics as UserAnalytics;
      
      // Cache the result
      if (analytics) {
        this.cache.set(cacheKey, {
          data: analytics,
          expires: Date.now() + this.CACHE_TTL
        });
      }

      console.log('✅ User analytics loaded');
      return analytics;
      
    } catch (error) {
      console.error('❌ Failed to fetch user analytics:', error);
      return null;
    }
  }

  async getAdminAnalytics(): Promise<AdminAnalytics | null> {
    const cacheKey = 'admin_analytics';
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() < cached.expires) {
        console.log('📊 Using cached admin analytics');
        return cached.data;
      }
    }

    try {
      console.log('📊 Fetching admin analytics');
      
      const { data: response, error } = await supabase.functions.invoke('user-analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'get_admin_analytics'
        }
      });

      if (error) {
        console.error('❌ Admin analytics error:', error);
        throw new Error(error.message);
      }

      if (!response?.success) {
        console.error('❌ Admin analytics failed:', response?.error);
        throw new Error(response?.error || 'Admin analytics fetch failed');
      }

      const analytics = response.data as AdminAnalytics;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: analytics,
        expires: Date.now() + this.CACHE_TTL
      });

      console.log('✅ Admin analytics loaded:', analytics.total_users, 'users');
      return analytics;
      
    } catch (error) {
      console.error('❌ Failed to fetch admin analytics:', error);
      return null;
    }
  }

  async startUserSession(telegramId: number, userAgent: string): Promise<string | null> {
    try {
      console.log('🚀 Starting user session for:', telegramId);
      
      const { data: response, error } = await supabase.functions.invoke('user-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'start_session'
        },
        body: { telegram_id: telegramId, user_agent: userAgent }
      });

      if (error) {
        console.error('❌ Session start error:', error);
        return null;
      }

      if (!response?.success) {
        console.error('❌ Session start failed:', response?.error);
        return null;
      }

      console.log('✅ Session started:', response.data.id);
      return response.data.id;
      
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      return null;
    }
  }

  async endUserSession(sessionId: string): Promise<boolean> {
    try {
      console.log('🛑 Ending user session:', sessionId);
      
      const { data: response, error } = await supabase.functions.invoke('user-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'end_session'
        },
        body: { session_id: sessionId }
      });

      if (error) {
        console.error('❌ Session end error:', error);
        return false;
      }

      console.log('✅ Session ended successfully');
      return response?.success || false;
      
    } catch (error) {
      console.error('❌ Failed to end session:', error);
      return false;
    }
  }

  async trackPageVisit(sessionId: string, pagePath: string, pageTitle?: string): Promise<boolean> {
    try {
      console.log('📄 Tracking page visit:', pagePath);
      
      const { data: response, error } = await supabase.functions.invoke('user-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'track_page_visit'
        },
        body: { session_id: sessionId, page_path: pagePath, page_title: pageTitle }
      });

      if (error) {
        console.error('❌ Page visit tracking error:', error);
        return false;
      }

      return response?.success || false;
      
    } catch (error) {
      console.error('❌ Failed to track page visit:', error);
      return false;
    }
  }

  clearCache(): void {
    console.log('🧹 Clearing analytics cache');
    this.cache.clear();
  }

  invalidateCache(key?: string): void {
    if (key) {
      console.log('🧹 Invalidating cache for:', key);
      this.cache.delete(key);
    } else {
      this.clearCache();
    }
  }
}

export const realTimeAnalyticsService = new RealTimeAnalyticsService();
