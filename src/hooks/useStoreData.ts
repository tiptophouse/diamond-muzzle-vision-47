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

  // Direct data transformation with correct database field mapping
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    
    return rawData
      .map(item => {
        // CRITICAL FIX: Map correct database fields for images
        let finalImageUrl = undefined;
        
        // CORRECTED Priority order based on actual database schema:
        // 1. picture (main image field)
        // 2. certificate_image_url (fallback image)
        const imageFields = [
          item.picture,           // Primary image field in database
          item.certificate_image_url, // Certificate image as fallback
        ];
        
        for (const imageField of imageFields) {
          if (imageField && 
              typeof imageField === 'string' && 
              imageField.trim() && 
              imageField !== 'default' && 
              !imageField.includes('.html') &&
              (imageField.startsWith('http') || imageField.startsWith('//'))) {
            finalImageUrl = imageField.trim();
            console.log('✅ FOUND IMAGE URL for', item.stock_number, ':', finalImageUrl);
            break;
          }
        }
        
        // FIXED: Get 360° URL from correct database field
        let final360Url = undefined;
        
        // CORRECTED: Use actual database field names
        const video360Fields = [
          item.v360_url,          // Actual database field for 360° videos
          item.gem360_url,        // Alternative field
          item.video_url,         // Generic video field
        ];
        
        for (const videoField of video360Fields) {
          if (videoField && 
              typeof videoField === 'string' && 
              videoField.trim()) {
            // Support various 360° formats
            if (videoField.includes('.html') || 
                videoField.includes('360') || 
                videoField.includes('v360.in') ||
                videoField.includes('gem360') ||
                videoField.includes('sarine')) {
              final360Url = videoField.trim();
              console.log('✅ FOUND 360° URL for', item.stock_number, ':', final360Url);
              break;
            }
          }
        }

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
          imageUrl: finalImageUrl,     // FIXED: Properly mapped image URL
          gem360Url: final360Url,      // FIXED: Properly mapped 360° URL
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number || undefined,
          lab: item.lab || undefined,
          certificateUrl: item.certificate_url || undefined,
          // Keep debug fields for troubleshooting
          _debug: {
            originalPicture: item.picture,
            originalV360: item.v360_url,
            originalCertImage: item.certificate_image_url
          }
        };

        // Enhanced logging for debugging
        console.log('🔧 FINAL TRANSFORM for', result.stockNumber, ':', {
          hasImage: !!result.imageUrl,
          has360: !!result.gem360Url,
          imageUrl: result.imageUrl,
          gem360Url: result.gem360Url,
          originalFields: {
            picture: item.picture,
            v360_url: item.v360_url,
            certificate_image_url: item.certificate_image_url
          }
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
      
      // Enhanced logging to debug API response
      console.log('🚨 RAW API RESPONSE:', {
        hasData: !!result.data,
        dataLength: result.data?.length || 0,
        error: result.error,
        firstItem: result.data?.[0] ? {
          id: result.data[0].id,
          stock_number: result.data[0].stock_number,
          picture: result.data[0].picture,
          v360_url: result.data[0].v360_url,
          certificate_image_url: result.data[0].certificate_image_url,
          allKeys: Object.keys(result.data[0]).filter(key => 
            key.includes('picture') || 
            key.includes('image') || 
            key.includes('360') || 
            key.includes('video')
          )
        } : null
      });

      if (result.error) {
        setError(result.error);
        setDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        const transformedDiamonds = transformData(result.data);
        
        // ENHANCED: Log transformation results
        const diamondsWithImages = transformedDiamonds.filter(d => d.imageUrl);
        const diamondsWith360 = transformedDiamonds.filter(d => d.gem360Url);
        
        console.log('🖼️ TRANSFORM SUMMARY:', {
          totalDiamonds: transformedDiamonds.length,
          diamondsWithImages: diamondsWithImages.length,
          diamondsWith360: diamondsWith360.length,
          sampleResults: transformedDiamonds.slice(0, 3).map(d => ({
            stock: d.stockNumber,
            hasImage: !!d.imageUrl,
            has360: !!d.gem360Url,
            imageUrl: d.imageUrl?.substring(0, 50) + '...',
            gem360Url: d.gem360Url?.substring(0, 50) + '...'
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
