
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { fetchInventoryData } from "@/services/inventoryDataService";

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

      console.log('🏪 STORE: Fetching data from FastAPI backend');
      const result = await fetchInventoryData();

      if (result.error) {
        console.error('🏪 STORE: Data fetch failed:', result.error);
        setError(result.error);
        setDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        // Transform data to match Diamond interface and filter for store-visible diamonds
        const transformedDiamonds: Diamond[] = result.data
          .map(item => ({
            id: item.id || `${item.stock_number}-${Date.now()}`,
            stockNumber: item.stock_number,
            shape: item.shape,
            carat: Number(item.weight || item.carat) || 0,
            color: item.color,
            clarity: item.clarity,
            cut: item.cut || 'Excellent',
            price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
            status: item.status || 'Available',
            imageUrl: item.picture || item.imageUrl || undefined,
            store_visible: item.store_visible !== false, // Default to true for store display
            certificateNumber: item.certificate_number || undefined,
            lab: item.lab || undefined,
            gem360Url: item.gem360_url || item.gem360Url || undefined,
            certificateUrl: item.certificate_url || item.certificateUrl || undefined
          }))
          .filter(diamond => diamond.store_visible && diamond.status === 'Available'); // Only show store-visible and available diamonds

        console.log('🏪 STORE: Processed', transformedDiamonds.length, 'store-visible diamonds from', result.data.length, 'total diamonds');
        console.log('🏪 STORE: Found', transformedDiamonds.filter(d => d.gem360Url || (d.certificateUrl && d.certificateUrl.includes('gem360.in'))).length, 'diamonds with 3D viewers');
        setDiamonds(transformedDiamonds);
      } else {
        console.log('🏪 STORE: No diamonds found in response');
        setDiamonds([]);
        setError("No diamonds available for store display");
      }
    } catch (err) {
      console.error('🏪 STORE: Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load store diamonds';
      setError(errorMessage);
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
