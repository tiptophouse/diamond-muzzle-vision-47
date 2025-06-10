
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseOptimizedInventoryReturn {
  diamonds: Diamond[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  addDiamond: (diamond: Partial<Diamond>) => Promise<boolean>;
  updateDiamond: (stockNumber: string, updates: Partial<Diamond>) => Promise<boolean>;
  deleteDiamond: (stockNumber: string) => Promise<boolean>;
  toggleStoreVisibility: (stockNumber: string) => Promise<boolean>;
  uploadImage: (stockNumber: string, file: File) => Promise<string | null>;
}

export function useOptimizedInventory(): UseOptimizedInventoryReturn {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();

  const fetchDiamonds = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching optimized inventory for user:', user.id);

      const { data, error: fetchError, count } = await supabase
        .from('inventory')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Inventory fetch error:', fetchError);
        throw fetchError;
      }

      const transformedDiamonds: Diamond[] = (data || []).map(item => ({
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
      }));

      setDiamonds(transformedDiamonds);
      setTotalCount(count || 0);
      
      console.log('✅ Inventory loaded:', transformedDiamonds.length, 'diamonds');
    } catch (err) {
      console.error('❌ Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  const addDiamond = useCallback(async (diamond: Partial<Diamond>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('inventory')
        .insert([{
          user_id: user.id,
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
        }]);

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

  const uploadImage = useCallback(async (stockNumber: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${stockNumber}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('diamond-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('diamond-images')
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // Update diamond with new image URL
      await updateDiamond(stockNumber, { imageUrl });

      toast({
        title: "Image Uploaded",
        description: "Diamond image successfully uploaded",
      });

      return imageUrl;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload diamond image",
        variant: "destructive",
      });
      return null;
    }
  }, [user?.id, updateDiamond, toast]);

  useEffect(() => {
    fetchDiamonds();
  }, [fetchDiamonds]);

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
    uploadImage,
  };
}
