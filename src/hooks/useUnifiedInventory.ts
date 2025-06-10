
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/types/diamond';

interface UseUnifiedInventoryOptions {
  storeOnly?: boolean;
  limit?: number;
  autoFetch?: boolean;
}

interface UseUnifiedInventoryReturn {
  diamonds: Diamond[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  addDiamond: (diamond: Partial<Diamond>) => Promise<boolean>;
  updateDiamond: (stockNumber: string, updates: Partial<Diamond>) => Promise<boolean>;
  deleteDiamond: (stockNumber: string) => Promise<boolean>;
  toggleStoreVisibility: (stockNumber: string) => Promise<boolean>;
}

export function useUnifiedInventory(options: UseUnifiedInventoryOptions = {}): UseUnifiedInventoryReturn {
  const { storeOnly = false, limit, autoFetch = true } = options;
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();

  const transformInventoryData = useCallback((data: any[]): Diamond[] => {
    return data.map(item => ({
      id: item.id,
      stockNumber: item.stock_number,
      shape: item.shape,
      carat: Number(item.weight),
      color: item.color,
      clarity: item.clarity,
      cut: item.cut || 'Excellent',
      price: Number(item.price_per_carat * item.weight) || 0,
      status: item.status || 'Available',
      imageUrl: item.picture || undefined,
      store_visible: item.store_visible || false,
      // Extended properties
      fluorescence: item.fluorescence,
      polish: item.polish,
      symmetry: item.symmetry,
      certificateNumber: item.certificate_number,
      certificateUrl: item.certificate_url,
      lab: item.lab,
      length: item.length,
      width: item.width,
      depth: item.depth,
      table: item.table_percentage,
      depthPercentage: item.depth_percentage,
      ratio: item.ratio,
      culet: item.culet,
      gridle: item.gridle,
      pricePerCarat: item.price_per_carat,
      rapnet: item.rapnet,
      certificateComment: item.certificate_comment,
    }));
  }, []);

  const fetchDiamonds = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Unified Inventory: Fetching diamonds...', { storeOnly, limit, userId: user?.id });

      let query = supabase
        .from('inventory')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filters based on options
      if (storeOnly) {
        query = query.eq('store_visible', true).eq('status', 'Available');
      } else if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('❌ Unified Inventory: Fetch error:', fetchError);
        throw fetchError;
      }

      const transformedDiamonds = transformInventoryData(data || []);
      setDiamonds(transformedDiamonds);
      setTotalCount(count || 0);
      
      console.log('✅ Unified Inventory: Successfully fetched', transformedDiamonds.length, 'diamonds');
    } catch (err) {
      console.error('❌ Unified Inventory: Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, storeOnly, limit, transformInventoryData]);

  const addDiamond = useCallback(async (diamond: Partial<Diamond>): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    try {
      const diamondData = {
        user_id: Number(user.id), // Ensure user_id is a number
        stock_number: diamond.stockNumber || `D${Date.now()}`,
        shape: diamond.shape || 'Round',
        weight: diamond.carat || 1,
        color: diamond.color || 'G',
        clarity: diamond.clarity || 'VS1',
        cut: diamond.cut || 'Excellent',
        price_per_carat: diamond.price ? Math.round(diamond.price / (diamond.carat || 1)) : 1000,
        status: diamond.status || 'Available',
        store_visible: diamond.store_visible || false,
        picture: diamond.imageUrl,
        fluorescence: diamond.fluorescence,
        polish: diamond.polish,
        symmetry: diamond.symmetry,
        certificate_number: diamond.certificateNumber ? Number(diamond.certificateNumber) : null,
        certificate_url: diamond.certificateUrl,
        lab: diamond.lab,
      };

      const { error } = await supabase
        .from('inventory')
        .insert(diamondData); // Pass single object, not array

      if (error) throw error;

      toast({
        title: "Diamond Added",
        description: "Diamond successfully added to inventory",
      });

      await fetchDiamonds();
      return true;
    } catch (error) {
      console.error('❌ Error adding diamond:', error);
      toast({
        title: "Error",
        description: "Failed to add diamond",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, fetchDiamonds, toast]);

  const updateDiamond = useCallback(async (stockNumber: string, updates: Partial<Diamond>): Promise<boolean> => {
    try {
      const updateData: any = {};
      
      if (updates.shape) updateData.shape = updates.shape;
      if (updates.carat) updateData.weight = updates.carat;
      if (updates.color) updateData.color = updates.color;
      if (updates.clarity) updateData.clarity = updates.clarity;
      if (updates.cut) updateData.cut = updates.cut;
      if (updates.price && updates.carat) updateData.price_per_carat = Math.round(updates.price / updates.carat);
      if (updates.status) updateData.status = updates.status;
      if (updates.imageUrl !== undefined) updateData.picture = updates.imageUrl;
      if (updates.store_visible !== undefined) updateData.store_visible = updates.store_visible;
      if (updates.fluorescence) updateData.fluorescence = updates.fluorescence;
      if (updates.polish) updateData.polish = updates.polish;
      if (updates.symmetry) updateData.symmetry = updates.symmetry;

      const { error } = await supabase
        .from('inventory')
        .update(updateData)
        .eq('stock_number', stockNumber)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Diamond Updated",
        description: "Diamond successfully updated",
      });

      await fetchDiamonds();
      return true;
    } catch (error) {
      console.error('❌ Error updating diamond:', error);
      toast({
        title: "Error",
        description: "Failed to update diamond",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, fetchDiamonds, toast]);

  const deleteDiamond = useCallback(async (stockNumber: string): Promise<boolean> => {
    try {
      // Soft delete by setting deleted_at timestamp
      const { error } = await supabase
        .from('inventory')
        .update({ deleted_at: new Date().toISOString() })
        .eq('stock_number', stockNumber)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Diamond Removed",
        description: "Diamond successfully removed from inventory",
      });

      await fetchDiamonds();
      return true;
    } catch (error) {
      console.error('❌ Error deleting diamond:', error);
      toast({
        title: "Error",
        description: "Failed to remove diamond",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, fetchDiamonds, toast]);

  const toggleStoreVisibility = useCallback(async (stockNumber: string): Promise<boolean> => {
    try {
      const diamond = diamonds.find(d => d.stockNumber === stockNumber);
      if (!diamond) return false;

      const { error } = await supabase
        .from('inventory')
        .update({ store_visible: !diamond.store_visible })
        .eq('stock_number', stockNumber)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: diamond.store_visible ? "Hidden from Store" : "Added to Store",
        description: `Diamond ${diamond.store_visible ? 'hidden from' : 'added to'} store`,
      });

      await fetchDiamonds();
      return true;
    } catch (error) {
      console.error('❌ Error toggling store visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update store visibility",
        variant: "destructive",
      });
      return false;
    }
  }, [diamonds, user?.id, fetchDiamonds, toast]);

  useEffect(() => {
    if (autoFetch) {
      fetchDiamonds();
    }
  }, [fetchDiamonds, autoFetch]);

  return {
    diamonds,
    loading,
    error,
    totalCount,
    refetch: fetchDiamonds,
    addDiamond,
    updateDiamond,
    deleteDiamond,
    toggleStoreVisibility,
  };
}
