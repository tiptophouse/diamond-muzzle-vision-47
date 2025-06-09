
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Diamond } from "@/components/inventory/InventoryTable";

export function useStoreData() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch ALL inventory items to display in store
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to match Diamond interface
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
      console.log(`✅ Loaded ${transformedDiamonds.length} diamonds for store`);
    } catch (err) {
      console.error('Error fetching store data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load diamonds');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    diamonds,
    loading,
    error,
    refetch: fetchStoreData,
  };
}
