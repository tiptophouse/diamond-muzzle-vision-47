
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';

interface InventoryResponse {
  data: Diamond[];
  source: 'external' | 'local' | 'hybrid';
  debugInfo: {
    step: string;
    externalCount?: number;
    localCount?: number;
    combinedCount?: number;
    timestamp: string;
  };
}

class UnifiedInventoryService {
  private cache: Map<string, { data: Diamond[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getInventory(userId: number, forceRefresh = false): Promise<InventoryResponse> {
    const cacheKey = `inventory_${userId}`;
    
    // Check cache first
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('📦 Using cached inventory data');
        return {
          data: cached.data,
          source: 'hybrid',
          debugInfo: {
            step: 'Cached data returned',
            combinedCount: cached.data.length,
            timestamp: new Date().toISOString()
          }
        };
      }
    }

    try {
      console.log('🔄 Fetching fresh inventory data for user:', userId);
      
      // Fetch from both sources in parallel
      const [externalData, localData] = await Promise.allSettled([
        this.fetchExternalInventory(userId),
        this.fetchLocalInventory(userId)
      ]);

      const external = externalData.status === 'fulfilled' ? externalData.value : [];
      const local = localData.status === 'fulfilled' ? localData.value : [];

      // Combine and deduplicate
      const combined = this.combineAndDeduplicate(external, local);

      // Update cache
      this.cache.set(cacheKey, {
        data: combined,
        timestamp: Date.now()
      });

      return {
        data: combined,
        source: 'hybrid',
        debugInfo: {
          step: 'Fresh data fetched and combined',
          externalCount: external.length,
          localCount: local.length,
          combinedCount: combined.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Unified inventory service error:', error);
      throw error;
    }
  }

  private async fetchExternalInventory(userId: number): Promise<Diamond[]> {
    try {
      console.log('🌐 Fetching external inventory via edge function');
      
      const { data, error } = await supabase.functions.invoke('get-external-inventory', {
        body: { user_id: userId }
      });

      if (error) throw error;

      return this.transformExternalData(data || []);
    } catch (error) {
      console.warn('⚠️ External inventory fetch failed:', error);
      return [];
    }
  }

  private async fetchLocalInventory(userId: number): Promise<Diamond[]> {
    try {
      console.log('💾 Fetching local inventory from Supabase');
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.transformLocalData(data || []);
    } catch (error) {
      console.warn('⚠️ Local inventory fetch failed:', error);
      return [];
    }
  }

  private transformExternalData(data: any[]): Diamond[] {
    return data.map((item: any, index: number) => ({
      id: item.id || `ext-${item.stock_number || index}`,
      stockNumber: item.stock_number || item.Stock || `STOCK-${index}`,
      shape: item.shape || item.Shape || 'Round',
      carat: Number(item.weight || item.Weight || item.carat || 1),
      color: item.color || item.Color || 'D',
      clarity: item.clarity || item.Clarity || 'VS1',
      cut: item.cut || item.Cut || 'Excellent',
      price: Number(item.price_per_carat || item['Price/Crt'] || item.price || 1000) * Number(item.weight || item.Weight || item.carat || 1),
      status: item.status || 'Available',
      imageUrl: item.picture || item.Pic || item.photo,
      store_visible: item.store_visible !== false,
      fluorescence: item.fluorescence || item.Fluo || 'None',
      lab: item.lab || item.Lab || 'GIA',
      certificate_number: item.certificate_number || item.CertNumber,
      polish: item.polish || item.Polish || 'Excellent',
      symmetry: item.symmetry || item.Symm || 'Excellent',
      table_percentage: item.table_percentage || item.Table,
      depth_percentage: item.depth_percentage || item.Depth,
      additional_images: this.extractAdditionalImages(item),
    }));
  }

  private transformLocalData(data: any[]): Diamond[] {
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

  private extractAdditionalImages(item: any): string[] {
    const images: string[] = [];
    if (item.picture2) images.push(item.picture2);
    if (item.picture3) images.push(item.picture3);
    if (item.picture4) images.push(item.picture4);
    if (item.image_gallery && Array.isArray(item.image_gallery)) {
      images.push(...item.image_gallery);
    }
    return images;
  }

  private combineAndDeduplicate(external: Diamond[], local: Diamond[]): Diamond[] {
    const combined: Diamond[] = [];
    const stockNumbers = new Set<string>();

    // External data takes priority
    external.forEach(diamond => {
      if (!stockNumbers.has(diamond.stockNumber)) {
        combined.push(diamond);
        stockNumbers.add(diamond.stockNumber);
      }
    });

    // Add local diamonds that don't exist in external
    local.forEach(diamond => {
      if (!stockNumbers.has(diamond.stockNumber)) {
        combined.push(diamond);
        stockNumbers.add(diamond.stockNumber);
      }
    });

    return combined;
  }

  clearCache() {
    this.cache.clear();
    console.log('🧹 Inventory cache cleared');
  }

  async deleteDiamond(diamondId: string, userId: number, isHardDelete = false): Promise<boolean> {
    try {
      console.log(`🗑️ ${isHardDelete ? 'Hard' : 'Soft'} deleting diamond:`, diamondId);

      const { data, error } = await supabase.functions.invoke('unified-diamond-crud', {
        body: {
          action: isHardDelete ? 'hard_delete' : 'soft_delete',
          diamond_id: diamondId,
          user_id: userId
        }
      });

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();
      
      return data?.success || false;
    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      return false;
    }
  }

  async updateDiamond(diamondId: string, updates: Partial<Diamond>, userId: number): Promise<boolean> {
    try {
      console.log('📝 Updating diamond:', diamondId);

      const { data, error } = await supabase.functions.invoke('unified-diamond-crud', {
        body: {
          action: 'update',
          diamond_id: diamondId,
          user_id: userId,
          updates: updates
        }
      });

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();
      
      return data?.success || false;
    } catch (error) {
      console.error('❌ Update operation failed:', error);
      return false;
    }
  }
}

export const unifiedInventoryService = new UnifiedInventoryService();
