
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryDataSync } from "./inventory/useInventoryDataSync";

export function useStoreData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [user, authLoading]);

  // Subscribe to inventory changes
  useEffect(() => {
    return subscribeToInventoryChanges(() => {
      if (user && !authLoading) {
        fetchStoreData();
      }
    });
  }, [user, authLoading, subscribeToInventoryChanges]);

  const fetchStoreData = async () => {
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
            console.log('🔍 STORE: Raw item data:', item);
            console.log('🔍 STORE: item.stock_number type:', typeof item.stock_number, 'value:', item.stock_number);

            return {
              id: String(item.id), // Use the stable FastAPI ID directly
              stockNumber: String(item.stock_number || item.stockNumber || 'UNKNOWN'),
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

        // Check for duplicate stock numbers and log warning
        const stockNumbers = transformedDiamonds.map(d => d.stockNumber);
        const duplicates = stockNumbers.filter((stock, index) => stockNumbers.indexOf(stock) !== index);
        if (duplicates.length > 0) {
          console.warn('🚨 STORE: Found duplicate stock numbers:', duplicates);
          console.warn('🚨 STORE: This could cause wrong diamond details to be shown!');
        }

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
  };

  return {
    diamonds,
    loading: loading || authLoading,
    error,
    refetch: fetchStoreData,
  };
}
