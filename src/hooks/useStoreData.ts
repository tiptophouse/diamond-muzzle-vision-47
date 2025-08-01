
import { useState, useEffect, useMemo, useCallback } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryDataSync } from "./inventory/useInventoryDataSync";
import { getTelegramWebApp } from "@/utils/telegramWebApp";

// Telegram memory management
const tg = getTelegramWebApp();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let dataCache: { data: Diamond[], timestamp: number } | null = null;

export function useStoreData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optimized data transformation with caching
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    return rawData
      .map(item => {
        let gem360Url = item.gem360_url || item.gem360Url;
        
        if (!gem360Url && item.certificate_url && item.certificate_url.includes('gem360')) {
          gem360Url = item.certificate_url;
        }
        
        if (!gem360Url && item.certificateUrl && item.certificateUrl.includes('gem360')) {
          gem360Url = item.certificateUrl;
        }

        console.log('🔍 STORE DATA: Processing item:', item.id, {
          stock: item.stock,
          picture: item.picture,
          Image: item.Image,
          'Video link': item['Video link'],
          imageUrl: item.imageUrl
        });

        // Prioritize Image field from CSV, then picture, then imageUrl
        let finalImageUrl = undefined;
        if (item.Image && item.Image !== 'default' && !item.Image.includes('.html')) {
          finalImageUrl = item.Image;
        } else if (item.picture && item.picture !== 'default' && !item.picture.includes('.html')) {
          finalImageUrl = item.picture;
        } else if (item.imageUrl && item.imageUrl !== 'default' && !item.imageUrl.includes('.html')) {
          finalImageUrl = item.imageUrl;
        }

        // Handle 360° URLs
        let final360Url = gem360Url;
        if (!final360Url && item['Video link'] && item['Video link'].includes('.html')) {
          final360Url = item['Video link'];
        }
        if (!final360Url && item.Image && item.Image.includes('.html')) {
          final360Url = item.Image;
        }

        const result = {
          id: String(item.id),
          stockNumber: String(item.stock || item.stock_number || item.stockNumber || 'UNKNOWN'),
          shape: item.shape,
          carat: Number(item.weight || item.carat) || 0,
          color: item.color,
          clarity: item.clarity,
          cut: item.cut || 'Excellent',
          price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
          status: item.status || 'Available',
          imageUrl: finalImageUrl,
          Image: item.Image,
          picture: item.picture,
          image: item.image,
          'Video link': item['Video link'],
          videoLink: item.videoLink,
          gem360Url: final360Url,
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number || undefined,
          lab: item.lab || undefined,
          certificateUrl: item.certificate_url || item.certificateUrl || undefined
        };

        console.log('🔍 STORE DATA: Final result:', {
          id: result.id,
          stockNumber: result.stockNumber,
          imageUrl: result.imageUrl,
          gem360Url: result.gem360Url,
          Image: result.Image,
          'Video link': result['Video link']
        });

        return result;
      })
      .filter(diamond => diamond.store_visible && diamond.status === 'Available');
  }, []);

  const fetchStoreData = useCallback(async (useCache = true) => {
    try {
      setError(null);

      // Check cache first
      if (useCache && dataCache && (Date.now() - dataCache.timestamp) < CACHE_DURATION) {
        setDiamonds(dataCache.data);
        setLoading(false);
        return;
      }

      setLoading(true);

      const result = await fetchInventoryData();
      
      // CRITICAL DEBUGGING: Log the raw API response
      console.log('🚨 RAW API RESPONSE:', {
        hasData: !!result.data,
        dataLength: result.data?.length || 0,
        error: result.error,
        firstItem: result.data?.[0] ? {
          id: result.data[0].id,
          stock: result.data[0].stock,
          picture: result.data[0].picture,
          Image: result.data[0].Image,
          image: result.data[0].image,
          imageUrl: result.data[0].imageUrl,
          'Video link': result.data[0]['Video link'],
          videoLink: result.data[0].videoLink,
          gem360Url: result.data[0].gem360Url,
          allKeys: Object.keys(result.data[0])
        } : null
      });

      if (result.error) {
        setError(result.error);
        setDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        const transformedDiamonds = transformData(result.data);
        
        // Update cache
        dataCache = {
          data: transformedDiamonds,
          timestamp: Date.now()
        };

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
  }, [transformData]);

  // Telegram memory optimization
  useEffect(() => {
    if (tg) {
      // Clear memory when component unmounts
      return () => {
        try {
          if ('gc' in window && typeof window.gc === 'function') {
            window.gc();
          }
        } catch (e) {
          // Ignore errors
        }
      };
    }
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

  // Subscribe to inventory changes
  useEffect(() => {
    return subscribeToInventoryChanges(() => {
      if (user && !authLoading) {
        // Clear cache and force refresh
        dataCache = null;
        fetchStoreData(false);
      }
    });
  }, [user, authLoading, subscribeToInventoryChanges, fetchStoreData]);

  const refetch = useCallback(() => {
    // Clear cache and force refresh
    dataCache = null;
    return fetchStoreData(false);
  }, [fetchStoreData]);

  return {
    diamonds,
    loading: loading || authLoading,
    error,
    refetch,
  };
}
