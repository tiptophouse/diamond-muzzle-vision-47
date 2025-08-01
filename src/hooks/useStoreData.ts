import { useState, useEffect, useMemo, useCallback } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryDataSync } from "./inventory/useInventoryDataSync";
import { getTelegramWebApp } from "@/utils/telegramWebApp";
import { detectFancyColor } from "@/utils/fancyColorUtils";

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

  // Enhanced image URL validation and processing
  const processImageUrl = useCallback((imageUrl: string | undefined): string | undefined => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return undefined;
    }

    const trimmedUrl = imageUrl.trim();
    
    // Skip invalid or placeholder values
    if (!trimmedUrl || 
        trimmedUrl === 'default' || 
        trimmedUrl === 'null' || 
        trimmedUrl === 'undefined' ||
        trimmedUrl.length < 10) {
      return undefined;
    }

    // Skip HTML viewers and non-image URLs
    if (trimmedUrl.includes('.html') ||
        trimmedUrl.includes('diamondview.aspx') ||
        trimmedUrl.includes('v360.in') ||
        trimmedUrl.includes('sarine')) {
      return undefined;
    }

    // Must be a valid HTTP/HTTPS URL
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return undefined;
    }

    // Must end with valid image extension
    if (!trimmedUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
      return undefined;
    }

    console.log('✅ VALID IMAGE URL processed:', trimmedUrl);
    return trimmedUrl;
  }, []);

  // Enhanced 360° URL detection for various formats
  const detect360Url = useCallback((item: any) => {
    const stockId = item.stock_number || item.stock || 'unknown';
    console.log('🔍 360° DETECTION for', stockId, '- checking fields:', {
      gem360_url: item.gem360_url,
      pic: item.pic,                    // YOUR CSV "Pic" field  
      Pic: item.Pic,                    // Capital P version
      picture: item.picture,
      Picture: item.Picture,            // Capital P version
      'Video link': item['Video link'],
      videoLink: item.videoLink,
      video_link: item.video_link,
      v360_url: item.v360_url,
      // Check if ANY field contains v360.in
      hasV360InAnyField: Object.values(item).some(val => 
        typeof val === 'string' && val.includes('v360.in')
      )
    });

    const potential360Fields = [
      item.gem360_url,        // From our new CSV mapping
      item.pic,               // YOUR CSV "Pic" field - MOST IMPORTANT!
      item.Pic,               // Capital P version
      item.picture,           // Alternative picture field
      item.Picture,           // Capital P version
      item['Video link'],     // Exact CSV field name with space
      item.videoLink,         // CamelCase version
      item.video_link,        // Snake case version
      item.v360_url,
      item.video_url,
      item.video360_url,
      item.three_d_url,
      item.rotation_url
    ];
    
    for (const url of potential360Fields) {
      if (url && typeof url === 'string' && url.trim()) {
        const cleanUrl = url.trim();
        console.log('🔍 Checking URL field:', cleanUrl);
        
        // Enhanced 360° URL detection - PRIORITIZE v360.in!
        if (cleanUrl.includes('v360.in') || 
            cleanUrl.includes('gem360') || 
            cleanUrl.includes('360view') || 
            cleanUrl.includes('diamondview') ||
            cleanUrl.includes('rotational') ||
            cleanUrl.includes('interactive') ||
            cleanUrl.includes('/360/') ||
            cleanUrl.includes('_360.') ||
            cleanUrl.includes('360.jpg') ||
            cleanUrl.includes('360.mp4') ||
            cleanUrl.includes('360.gif')) {
          console.log('✅ 360° URL FOUND for', stockId + ':', cleanUrl);
          return cleanUrl;
        }
      }
    }
    
    console.log('❌ NO 360° URL found for', stockId);
    return undefined;
  }, []);

  // Direct data transformation with enhanced image processing
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    
    return rawData
      .map(item => {
        // Enhanced image URL detection with multiple fallbacks
        let finalImageUrl = undefined;
        const imageFields = [
          item.picture,
          item.image_url,
          item.imageUrl,
          item.Image, // CSV field
          item.image,
        ];
        
        // Process each potential image field
        for (const imageField of imageFields) {
          const processedUrl = processImageUrl(imageField);
          if (processedUrl) {
            finalImageUrl = processedUrl;
            console.log('✅ FOUND VALID IMAGE for', item.stock_number || item.stock, ':', finalImageUrl);
            break;
          }
        }
        
        // Enhanced 360° URL detection
        const final360Url = detect360Url(item);

        // Determine color type based on the color value
        const colorType = item.color_type || (detectFancyColor(item.color).isFancyColor ? 'Fancy' : 'Standard');

        const result = {
          id: String(item.id),
          stockNumber: String(item.stock_number || item.stock || 'UNKNOWN'),
          shape: item.shape,
          carat: Number(item.weight || item.carat) || 0,
          color: item.color,
          color_type: colorType as 'Fancy' | 'Standard',
          clarity: item.clarity,
          cut: item.cut || 'Excellent',
          polish: item.polish,
          symmetry: item.symmetry,
          price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
          status: item.status || 'Available',
          imageUrl: finalImageUrl,
          gem360Url: final360Url,
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number || undefined,
          lab: item.lab || undefined,
          certificateUrl: item.certificate_url || undefined,
        };

        // Enhanced logging for debugging
        console.log('🔧 FINAL TRANSFORM for', result.stockNumber, ':', {
          hasImage: !!result.imageUrl,
          has360: !!result.gem360Url,
          imageUrl: result.imageUrl,
          gem360Url: result.gem360Url,
          originalPicture: item.picture,
          originalImageUrl: item.image_url,
        });

        return result;
      })
      .filter(diamond => diamond.store_visible && diamond.status === 'Available')
      .sort((a, b) => {
        // PRIORITY SORTING: v360.in first, then other 360°, then images, then info-only
        const aIsV360 = !!(a.gem360Url && a.gem360Url.includes('v360.in'));
        const bIsV360 = !!(b.gem360Url && b.gem360Url.includes('v360.in'));
        
        const aHas360 = !!a.gem360Url;
        const bHas360 = !!b.gem360Url;
        
        const aHasImage = !!a.imageUrl;
        const bHasImage = !!b.imageUrl;
        
        // Priority 1: v360.in diamonds first
        if (aIsV360 && !bIsV360) return -1;
        if (!aIsV360 && bIsV360) return 1;
        
        // Priority 2: Other 360° diamonds
        if (aHas360 && !bHas360) return -1;
        if (!aHas360 && bHas360) return 1;
        
        // Priority 3: Diamonds with images
        if (aHasImage && !bHasImage) return -1;
        if (!aHasImage && bHasImage) return 1;
        
        // Priority 4: Sort by price (highest first) within same priority level
        return (b.price || 0) - (a.price || 0);
      });
  }, [processImageUrl, detect360Url]);

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
        firstItem: result.data?.[0],
        // CRITICAL: Check if v360.in URLs exist in raw data
        hasV360InRawData: result.data ? result.data.some(item => 
          Object.values(item).some(val => 
            typeof val === 'string' && val.includes('v360.in')
          )
        ) : false
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
