import { useState, useEffect, useMemo, useCallback } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryDataSync } from "./inventory/useInventoryDataSync";
import { getTelegramWebApp } from "@/utils/telegramWebApp";
import { detectFancyColor } from "@/utils/fancyColorUtils";
import { processImageUrl, detect360Url } from "@/utils/diamondImageUtils";

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

  // Helper function to parse numbers from various formats
  const parseNumber = useCallback((value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove commas, currency symbols, and extra spaces
      const cleaned = value.replace(/[$,\s]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, []);

  // Enhanced 360° URL detection with priority for my360.fab and HTML viewers
  const detect360UrlFromItem = useCallback((item: any): string | undefined => {
    // All possible fields that might contain 360° URLs
    const potential360Fields = [
      item.picture,           
      item.image_url,         
      item.imageUrl,          
      item.img_url,           
      item.imgUrl,            
      item.v360_url,          
      item.gem360_url,        
      item.video_url,         
      item.video360_url,      
      item.three_d_url,       
      item.rotation_url,      
      item['Video link'],     
      item.videoLink,         
      item.video_link,        
      item.view360_url,       
      item.view360Url,        
      item.viewer_url,        
      item.viewerUrl,         
      item.threed_url,        
      item.threedUrl,         
      item['3d_url'],         
      item['3dUrl'],          
      item.sarine_url,        
      item.sarineUrl,         
      item.diamond_viewer,    
      item.diamondViewer,     
      item.interactive_view,  
      item.interactiveView,   
    ];
    
    for (const field of potential360Fields) {
      const result = detect360Url(field);
      if (result) {
        return result;
      }
    }
    return undefined;
  }, []);

  // Direct data transformation with enhanced media processing
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    
    const transformedData = rawData
      .map((item, index) => {
        // PHASE 1: Detect 360° URLs first (highest priority)
        const final360Url = detect360UrlFromItem(item);
        
        // PHASE 2: Process regular image URLs (excluding 360° URLs)
        let finalImageUrl = undefined;
        const imageFields = [
          item.picture,          
          item.imageUrl,         
          item.image_url,        
          item.Image,            
          item.image,            
          item.photo_url,        
          item.photoUrl,         
          item.diamond_image,    
          item.diamondImage,     
          item.media_url,        
          item.mediaUrl,         
          item.img_url,          
          item.imgUrl,           
          item.photo,            
          item.img,              
          item.thumbnail_url,    
          item.thumbnailUrl,     
          item.product_image,    
          item.productImage,     
        ];
        
        // Process each potential image field
        for (const imageField of imageFields) {
          const processedUrl = processImageUrl(imageField);
          if (processedUrl) {
            finalImageUrl = processedUrl;
            break;
          }
        }

        // PHASE 3: Enhanced price calculation
        const weight = parseNumber(item.weight || item.carat || item.Weight || 0);
        const pricePerCarat = parseNumber(item.price_per_carat || item.pricePerCarat || item.price_carat || 0);
        const totalPrice = parseNumber(item.price || item.total_price || item.totalPrice || 0);
        
        // Calculate final price with better logic
        let finalPrice = 0;
        if (totalPrice > 0) {
          finalPrice = totalPrice;
        } else if (pricePerCarat > 0 && weight > 0) {
          finalPrice = pricePerCarat * weight;
        }

        // Determine color type based on the color value
        const colorType = item.color_type || (detectFancyColor(item.color).isFancyColor ? 'Fancy' : 'Standard');

        const result = {
          id: String(item.id || `diamond_${index}`),
          stockNumber: String(item.stock_number || item.stock || item.stockNumber || `STOCK_${index}`),
          shape: item.shape || item.Shape || 'Round',
          carat: weight,
          color: item.color || item.Color || 'D',
          color_type: colorType as 'Fancy' | 'Standard',
          clarity: item.clarity || item.Clarity || 'FL',
          cut: item.cut || item.Cut || item.Make || 'Excellent',
          polish: item.polish || item.Polish || undefined,
          symmetry: item.symmetry || item.Symmetry || undefined,
          price: finalPrice,
          status: item.status || item.Availability || 'Available',
          imageUrl: finalImageUrl,
          gem360Url: final360Url,
          store_visible: item.store_visible !== false, // Default to true unless explicitly false
          certificateNumber: item.certificate_number || item.certificateNumber || undefined,
          lab: item.lab || item.Lab || undefined,
          certificateUrl: item.certificate_url || item.certificateUrl || undefined,
        };


        return result;
      })
      .filter(diamond => {
        // Only filter out if explicitly marked as not visible or unavailable
        const isVisible = diamond.store_visible !== false;
        const isAvailable = diamond.status === 'Available';
        
        return isVisible && isAvailable;
      });


    return transformedData;
  }, [detect360UrlFromItem, parseNumber]);

  const fetchStoreData = useCallback(async (useCache = true) => {
    try {
      setError(null);

      if (useCache && dataCache && (Date.now() - dataCache.timestamp) < CACHE_DURATION) {
        setDiamonds(dataCache.data);
        setLoading(false);
        return;
      }

      setLoading(true);

      const result = await fetchInventoryData();

      if (result.error) {
        setError(result.error);
        setDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        const transformedDiamonds = transformData(result.data);
        
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
