
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { toast } from "@/components/ui/use-toast";

export function useSupabaseInventory() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useTelegramAuth();

  useEffect(() => {
    if (user?.id) {
      fetchInventory();
    }
  }, [user?.id]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform Supabase data to Diamond interface
      const transformedDiamonds: Diamond[] = (data || []).map(item => ({
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
      const { data, error: insertError } = await supabase
        .from('inventory')
        .insert({
          user_id: user?.id,
          stock_number: diamondData.stockNumber,
          shape: diamondData.shape,
          weight: diamondData.carat,
          color: diamondData.color,
          clarity: diamondData.clarity,
          cut: diamondData.cut,
          price_per_carat: diamondData.price && diamondData.carat ? Math.round(diamondData.price / diamondData.carat) : 0,
          status: diamondData.status || 'Available',
          picture: diamondData.imageUrl,
          store_visible: diamondData.store_visible ?? true,
          fluorescence: diamondData.fluorescence,
          lab: diamondData.lab,
          polish: diamondData.polish,
          symmetry: diamondData.symmetry,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchInventory();
      
      toast({
        title: "Diamond Added! ✨",
        description: `${diamondData.stockNumber} has been added to your inventory.`,
      });

      return true;
    } catch (error) {
      console.error('Error adding diamond:', error);
      toast({
        variant: "destructive",
        title: "Failed to add diamond",
        description: error instanceof Error ? error.message : "Please try again.",
      });
      return false;
    }
  };

  const updateDiamond = async (id: string, diamondData: Partial<Diamond>) => {
    try {
      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          stock_number: diamondData.stockNumber,
          shape: diamondData.shape,
          weight: diamondData.carat,
          color: diamondData.color,
          clarity: diamondData.clarity,
          cut: diamondData.cut,
          price_per_carat: diamondData.price && diamondData.carat ? Math.round(diamondData.price / diamondData.carat) : 0,
          status: diamondData.status,
          picture: diamondData.imageUrl,
          store_visible: diamondData.store_visible,
          fluorescence: diamondData.fluorescence,
          lab: diamondData.lab,
          polish: diamondData.polish,
          symmetry: diamondData.symmetry,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      await fetchInventory();
      
      toast({
        title: "Diamond Updated! ✨",
        description: `${diamondData.stockNumber} has been updated successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Error updating diamond:', error);
      toast({
        variant: "destructive",
        title: "Failed to update diamond",
        description: error instanceof Error ? error.message : "Please try again.",
      });
      return false;
    }
  };

  const deleteDiamond = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      await fetchInventory();
      
      toast({
        title: "Diamond Deleted",
        description: "Diamond has been removed from your inventory.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting diamond:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete diamond",
        description: error instanceof Error ? error.message : "Please try again.",
      });
      return false;
    }
  };

  const toggleStoreVisibility = async (id: string, visible: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ store_visible: visible })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      await fetchInventory();
      
      toast({
        title: visible ? "Added to Store" : "Removed from Store",
        description: `Diamond is now ${visible ? 'visible' : 'hidden'} in your store.`,
      });

      return true;
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
    updateDiamond,
    deleteDiamond,
    toggleStoreVisibility,
    refreshInventory: fetchInventory,
  };
}
