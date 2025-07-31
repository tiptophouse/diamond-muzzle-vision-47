
import { useState, useEffect, useMemo, useCallback } from "react";
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
  
  // Cache for processed data to avoid re-processing
  const [dataCache, setDataCache] = useState<{ rawData: any[], processedData: Diamond[] } | null>(null);

  // Memoized data transformation function
  const transformData = useMemo(() => (rawData: any[]): Diamond[] => {
    return rawData
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
  }, []);

  const fetchStoreData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchInventoryData();

      if (result.error) {
        setError(result.error);
        setDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        // Check if we can reuse cached processed data
        if (dataCache && JSON.stringify(dataCache.rawData) === JSON.stringify(result.data)) {
          setDiamonds(dataCache.processedData);
          return;
        }

        // Transform data using memoized function
        const transformedDiamonds = transformData(result.data);

        // Update cache
        setDataCache({
          rawData: result.data,
          processedData: transformedDiamonds
        });

        setDiamonds(transformedDiamonds);
      } else {
        setDiamonds([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load store diamonds';
      setError(errorMessage);
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [transformData, dataCache]);

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

  // Subscribe to inventory changes
  useEffect(() => {
    return subscribeToInventoryChanges(() => {
      if (user && !authLoading) {
        fetchStoreData();
      }
    });
  }, [user, authLoading, subscribeToInventoryChanges, fetchStoreData]);

  return {
    diamonds,
    loading: loading || authLoading,
    error,
    refetch: fetchStoreData,
  };
}
