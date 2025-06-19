
import { useState, useEffect, useCallback } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function useStoreData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏪 STORE: Fetching data from FastAPI backend for authenticated user');
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
          .map(item => {
            // Better Gem360 URL detection and handling
            let gem360Url = item.gem360_url || item.gem360Url;
            
            // Check if certificate_url contains gem360
            if (!gem360Url && item.certificate_url && item.certificate_url.includes('gem360')) {
              gem360Url = item.certificate_url;
            }
            
            // Check if certificateUrl contains gem360
            if (!gem360Url && item.certificateUrl && item.certificateUrl.includes('gem360')) {
              gem360Url = item.certificateUrl;
            }

            console.log('🔍 STORE: Processing diamond', item.stock_number, 'gem360 URL:', gem360Url);

            return {
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
              gem360Url: gem360Url || undefined,
              certificateUrl: item.certificate_url || item.certificateUrl || undefined
            };
          })
          .filter(diamond => diamond.store_visible && diamond.status === 'Available'); // Only show store-visible and available diamonds

        console.log('🏪 STORE: Processed', transformedDiamonds.length, 'store-visible diamonds from', result.data.length, 'total diamonds');
        console.log('🏪 STORE: Found', transformedDiamonds.filter(d => d.gem360Url).length, 'diamonds with Gem360 URLs');
        setDiamonds(transformedDiamonds);
      } else {
        console.log('🏪 STORE: No diamonds found in response');
        setDiamonds([]);
      }
    } catch (err) {
      console.error('🏪 STORE: Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load store diamonds';
      setError(errorMessage);
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // State management functions for immediate UI updates
  const removeDiamondFromState = useCallback((diamondId: string) => {
    console.log('🗑️ STORE: Optimistically removing diamond from state:', diamondId);
    setDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
  }, []);

  const restoreDiamondToState = useCallback((diamond: Diamond) => {
    console.log('🔄 STORE: Restoring diamond to state:', diamond.id);
    setDiamonds(prev => [...prev, diamond]);
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (user) {
      fetchStoreData();
    } else {
      setLoading(false);
      setDiamonds([]);
      setError("Please log in to view your store items.");
    }
  }, [user, authLoading, fetchStoreData]);

  return {
    diamonds,
    loading: loading || authLoading,
    error,
    refetch: fetchStoreData,
    removeDiamondFromState,
    restoreDiamondToState,
  };
}
