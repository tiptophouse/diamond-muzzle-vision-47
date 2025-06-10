
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

      console.log('🏪 Fetching store data from inventory...');

      // Fetch all inventory items that should be visible in store
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('store_visible', true)
        .eq('status', 'Available')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Store fetch error:', fetchError);
        throw fetchError;
      }

      console.log('🏪 Raw store data received:', data?.length || 0, 'items');

      // If no store_visible items, show all available inventory
      let storeData = data;
      if (!data || data.length === 0) {
        console.log('🔍 No store_visible items, fetching all available inventory...');
        
        const { data: allData, error: allError } = await supabase
          .from('inventory')
          .select('*')
          .eq('status', 'Available')
          .order('created_at', { ascending: false })
          .limit(50); // Limit for performance

        if (allError) {
          throw allError;
        }

        storeData = allData;
        console.log('🔍 Using all inventory items:', storeData?.length || 0);
      }

      // Transform data to match Diamond interface
      const transformedDiamonds: Diamond[] = (storeData || []).map(item => ({
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

      console.log('✅ Store diamonds transformed:', transformedDiamonds.length);
      setDiamonds(transformedDiamonds);
    } catch (err) {
      console.error('❌ Error fetching store data:', err);
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
