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

  // Enhanced 360° URL detection for various formats
  const detect360Url = useCallback((item: any) => {
    const potential360Fields = [
      item.v360_url,
      item.gem360_url,
      item.video_url,
      item.video360_url,
      item.three_d_url,
      item.rotation_url
    ];
    
    for (const field of potential360Fields) {
      if (field && typeof field === 'string' && field.trim()) {
        const url = field.trim();
        // Enhanced detection for 360° formats including your examples
        if (url.includes('my360.sela') ||
            url.includes('v360.in') ||
            url.includes('diamondview.aspx') ||
            url.includes('gem360') ||
            url.includes('360') ||
            url.includes('sarine') ||
            url.includes('3d') ||
            url.includes('rotate') ||
            url.includes('.html') ||
            url.match(/DAN\d+-\d+[A-Z]?\.jpg$/)) { // Pattern like DAN040-0016A.jpg
          console.log('✨ DETECTED 360° URL for', item.stock_number, ':', url);
          return url;
        }
      }
    }
    return undefined;
  }, []);

  // Direct data transformation with enhanced 360° detection
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    
    return rawData
      .map(item => {
        // Enhanced image URL detection
        let finalImageUrl = undefined;
        const imageFields = [
          item.picture,
          item.image_url,
          item.certificate_image_url,
        ];
        
        for (const imageField of imageFields) {
          if (imageField && 
              typeof imageField === 'string' && 
              imageField.trim() && 
              imageField !== 'default' && 
              !imageField.includes('.html') &&
              !imageField.includes('diamondview.aspx') &&
              (imageField.startsWith('http') || imageField.startsWith('//'))) {
            // Validate it's actually an image URL, not a 360° viewer
            if (imageField.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
              finalImageUrl = imageField.trim();
              console.log('✅ FOUND IMAGE URL for', item.stock_number, ':', finalImageUrl);
              break;
            }
          }
        }
        
        // Enhanced 360° URL detection
        const final360Url = detect360Url(item);

        const result = {
          id: String(item.id),
          stockNumber: String(item.stock_number || item.stock || 'UNKNOWN'),
          shape: item.shape,
          carat: Number(item.weight || item.carat) || 0,
          color: item.color,
          clarity: item.clarity,
          cut: item.cut || 'Excellent',
          price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
          status: item.status || 'Available',
          imageUrl: finalImageUrl,
          gem360Url: final360Url,
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number || undefined,
          lab: item.lab || undefined,
          certificateUrl: item.certificate_url || undefined,
        };

        // Enhanced logging
        console.log('🔧 FINAL TRANSFORM for', result.stockNumber, ':', {
          hasImage: !!result.imageUrl,
          has360: !!result.gem360Url,
          imageUrl: result.imageUrl,
          gem360Url: result.gem360Url,
        });

        return result;
      })
      .filter(diamond => diamond.store_visible && diamond.status === 'Available');
  }, [detect360Url]);

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
      
      console.log('🚨 RAW API RESPONSE:', {
        hasData: !!result.data,
        dataLength: result.data?.length || 0,
        error: result.error,
        firstItem: result.data?.[0]
      });

      if (result.error) {
        setError(result.error);
        setDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        const transformedDiamonds = transformData(result.data);
        
        const diamondsWithImages = transformedDiamonds.filter(d => d.imageUrl);
        const diamondsWith360 = transformedDiamonds.filter(d => d.gem360Url);
        
        console.log('🖼️ TRANSFORM SUMMARY:', {
          totalDiamonds: transformedDiamonds.length,
          diamondsWithImages: diamondsWithImages.length,
          diamondsWith360: diamondsWith360.length,
        });
        
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

  useEffect(() => {
    return subscribeToInventoryChanges(() => {
      if (user && !authLoading) {
        dataCache = null;
        fetchStoreData(false);
      }
    });
  }, [user, authLoading, subscribeToInventoryChanges, fetchStoreData]);

  const refetch = useCallback(() => {
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
