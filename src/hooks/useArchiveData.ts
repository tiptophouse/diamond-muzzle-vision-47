
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useArchiveData() {
  const [archivedDiamonds, setArchivedDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useTelegramAuth();

  const fetchArchivedData = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching archived diamonds for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Transform data to Diamond interface
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

      setArchivedDiamonds(transformedDiamonds);
      console.log(`Loaded ${transformedDiamonds.length} archived diamonds`);
    } catch (err) {
      console.error('Error fetching archived diamonds:', err);
      setError(err instanceof Error ? err.message : 'Failed to load archived diamonds');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load archived diamonds",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedData();
  }, [user?.id]);

  const refreshData = () => {
    fetchArchivedData();
  };

  return {
    archivedDiamonds,
    loading,
    error,
    refreshData,
  };
}
