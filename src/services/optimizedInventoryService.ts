
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';

interface OptimizedInventoryFilters {
  shape?: string;
  status?: string;
  store_visible?: boolean;
  search?: string;
  limit?: number;
}

class OptimizedInventoryService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  // Ultra-fast inventory fetch
  async getInventory(userId: number, filters: OptimizedInventoryFilters = {}): Promise<Diamond[]> {
    const cacheKey = `inventory_${userId}_${JSON.stringify(filters)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('📦 Using cached data');
        return this.transformData(cached.data);
      }
    }

    try {
      console.log('🚀 Fetching via optimized PostgreSQL connection');
      
      const { data, error } = await supabase.functions.invoke('postgres-inventory-crud', {
        body: {
          action: 'get_inventory',
          user_id: userId,
          filters
        }
      });

      if (error) throw error;

      const transformedData = this.transformData(data.data || []);
      
      // Update cache
      this.cache.set(cacheKey, {
        data: data.data || [],
        timestamp: Date.now()
      });

      return transformedData;
      
    } catch (error) {
      console.error('❌ Optimized inventory fetch failed:', error);
      throw error;
    }
  }

  // Lightning-fast create
  async createDiamond(userId: number, diamondData: any): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('postgres-inventory-crud', {
        body: {
          action: 'create_diamond',
          user_id: userId,
          data: diamondData
        }
      });

      if (error) throw error;
      
      this.clearCache(userId);
      return true;
      
    } catch (error) {
      console.error('❌ Create failed:', error);
      return false;
    }
  }

  // Ultra-fast update
  async updateDiamond(userId: number, diamondId: string, updates: any): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('postgres-inventory-crud', {
        body: {
          action: 'update_diamond',
          user_id: userId,
          diamond_id: diamondId,
          data: updates
        }
      });

      if (error) throw error;
      
      this.clearCache(userId);
      return true;
      
    } catch (error) {
      console.error('❌ Update failed:', error);
      return false;
    }
  }

  // Super-fast delete
  async deleteDiamond(userId: number, diamondId: string, hardDelete = false): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('postgres-inventory-crud', {
        body: {
          action: 'delete_diamond',
          user_id: userId,
          diamond_id: diamondId,
          data: { hard_delete: hardDelete }
        }
      });

      if (error) throw error;
      
      this.clearCache(userId);
      return true;
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
      return false;
    }
  }

  // Bulk operations for maximum performance
  async bulkOperations(userId: number, operation: string, items: any[]): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('postgres-inventory-crud', {
        body: {
          action: 'bulk_operations',
          user_id: userId,
          data: { operation, items }
        }
      });

      if (error) throw error;
      
      this.clearCache(userId);
      return true;
      
    } catch (error) {
      console.error('❌ Bulk operation failed:', error);
      return false;
    }
  }

  private transformData(data: any[]): Diamond[] {
    return data.map(item => ({
      id: item.id,
      stockNumber: item.stock_number,
      shape: item.shape,
      carat: item.weight,
      color: item.color,
      clarity: item.clarity,
      cut: item.cut || 'Excellent',
      price: item.price_per_carat ? item.price_per_carat * item.weight : 0,
      status: item.status || 'Available',
      imageUrl: item.picture,
      store_visible: item.store_visible,
      fluorescence: item.fluorescence,
      lab: item.lab,
      certificate_number: item.certificate_number?.toString(),
      polish: item.polish,
      symmetry: item.symmetry,
      table_percentage: item.table_percentage,
      depth_percentage: item.depth_percentage,
      additional_images: [],
    }));
  }

  private clearCache(userId: number) {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith(`inventory_${userId}`)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearAllCache() {
    this.cache.clear();
  }
}

export const optimizedInventoryService = new OptimizedInventoryService();
