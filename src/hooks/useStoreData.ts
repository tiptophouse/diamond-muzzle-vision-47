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

  // Direct and simple data transformation focused on getting images to display
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    
    return rawData
      .map(item => {
        // Get the primary image URL - check all possible fields
        let finalImageUrl = undefined;
        
        // Priority order: Image (CSV) > picture > imageUrl > image
        const imageFields = [
          item.Image,        // CSV Image field
          item.picture,      // FastAPI picture field  
          item.imageUrl,     // Standard imageUrl field
          item.image         // Generic image field
        ];
        
        for (const imageField of imageFields) {
          if (imageField && 
              typeof imageField === 'string' && 
              imageField.trim() && 
              imageField !== 'default' && 
              !imageField.includes('.html') &&
              (imageField.startsWith('http') || imageField.startsWith('//'))) {
            finalImageUrl = imageField.trim();
            console.log('✅ FOUND IMAGE URL for', item.stock, ':', finalImageUrl);
            break;
          }
        }
        
        // Get 360° URL
        let final360Url = undefined;
        const video360Fields = [
          item.gem360Url,
          item['Video link'],
          item.videoLink
        ];
        
        for (const videoField of video360Fields) {
          if (videoField && 
              typeof videoField === 'string' && 
              videoField.trim() && 
              videoField.includes('.html')) {
            final360Url = videoField.trim();
            console.log('✅ FOUND 360° URL for', item.stock, ':', final360Url);
            break;
          }
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
          imageUrl: finalImageUrl, // This is what the store will use
          gem360Url: final360Url,  // This is what the store will use for 360°
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number || undefined,
          lab: item.lab || undefined,
          certificateUrl: item.certificate_url || item.certificateUrl || undefined,
          // Keep original fields for debugging
          Image: item.Image,
          picture: item.picture,
          image: item.image,
          'Video link': item['Video link'],
          videoLink: item.videoLink
        };

        // Log the final result for each diamond
        console.log('🔧 FINAL TRANSFORM for', result.stockNumber, ':', {
          finalImageUrl: result.imageUrl,
          final360Url: result.gem360Url,
          originalImage: item.Image,
          originalPicture: item.picture
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
      
      // Log what we got from the API
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
        
        // Log how many diamonds have images after transformation
        const diamondsWithImages = transformedDiamonds.filter(d => d.imageUrl);
        console.log('🖼️ TRANSFORM SUMMARY:', {
          totalDiamonds: transformedDiamonds.length,
          diamondsWithImages: diamondsWithImages.length,
          diamondsWith360: transformedDiamonds.filter(d => d.gem360Url).length,
          sampleImageUrls: diamondsWithImages.slice(0, 3).map(d => ({ 
            stock: d.stockNumber, 
            imageUrl: d.imageUrl 
          }))
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
