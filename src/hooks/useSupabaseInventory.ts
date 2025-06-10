
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { toast } from "@/components/ui/use-toast";
import { useEdgeFunctionCrud } from "./useEdgeFunctionCrud";

export function useSupabaseInventory() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useTelegramAuth();
  const { getDiamonds, createDiamond, updateDiamond, deleteDiamond } = useEdgeFunctionCrud();

  useEffect(() => {
    if (user?.id) {
      fetchInventory();
    }
  }, [user?.id]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDiamonds();
      
      // Transform Supabase data to Diamond interface, filtering out soft-deleted items
      const transformedDiamonds: Diamond[] = (data || [])
        .filter(item => !item.deleted_at) // Filter out soft-deleted items
        .map(item => ({
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

      setDiamonds(transformedDiamonds);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const addDiamond = async (diamondData: Partial<Diamond>) => {
    try {
      const success = await createDiamond(diamondData as any);
      if (success) {
        await fetchInventory();
      }
      return success;
    } catch (error) {
      console.error('Error adding diamond:', error);
      return false;
    }
  };

  const updateDiamondById = async (id: string, diamondData: Partial<Diamond>) => {
    try {
      const success = await updateDiamond(id, diamondData as any);
      if (success) {
        await fetchInventory();
      }
      return success;
    } catch (error) {
      console.error('Error updating diamond:', error);
      return false;
    }
  };

  const deleteDiamondById = async (id: string) => {
    try {
      const success = await deleteDiamond(id);
      if (success) {
        await fetchInventory();
      }
      return success;
    } catch (error) {
      console.error('Error deleting diamond:', error);
      return false;
    }
  };

  const toggleStoreVisibility = async (id: string, visible: boolean) => {
    try {
      const diamond = diamonds.find(d => d.id === id);
      if (!diamond) return false;

      const success = await updateDiamond(id, { ...diamond, store_visible: visible } as any);
      if (success) {
        await fetchInventory();
        toast({
          title: visible ? "Added to Store" : "Removed from Store",
          description: `Diamond is now ${visible ? 'visible' : 'hidden'} in your store.`,
        });
      }
      return success;
    } catch (error) {
      console.error('Error updating store visibility:', error);
      return false;
    }
  };

  return {
    diamonds,
    loading,
    error,
    addDiamond,
    updateDiamond: updateDiamondById,
    deleteDiamond: deleteDiamondById,
    toggleStoreVisibility,
    refreshInventory: fetchInventory,
  };
}
