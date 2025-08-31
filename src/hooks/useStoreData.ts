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

  // Enhanced 360° URL detection with PRIORITY for your my360.fab domain
  const detect360Url = useCallback((item: any): string | undefined => {
    // All possible fields that might contain 360° URLs - PRIORITIZING YOUR FORMAT
    const potential360Fields = [
      item.my360_fab_url,       // YOUR SPECIFIC FIELD - HIGHEST PRIORITY
      item.picture,           
      item.video_url,           // LIKELY YOUR MAIN FIELD
      item['Video link'],       // CSV format
      item.videoLink,           
      item.image_url,         
      item.imageUrl,          
      item.img_url,           
      item.imgUrl,            
      item.v360_url,          
      item.gem360_url,        
      item.video360_url,      
      item.three_d_url,       
      item.rotation_url,      
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
      if (field && typeof field === 'string' && field.trim()) {
        const url = field.trim();
        
        // Enhanced detection patterns with HIGHEST PRIORITY for your my360.fab format
        const is360Url = 
          url.includes('my360.fab') ||          // YOUR FORMAT - ABSOLUTE HIGHEST PRIORITY
          url.includes('s3.eu-west-1.amazonaws.com') || // Your S3 domain
          url.includes('my360.sela') ||         
          url.includes('v360.in') ||            
          url.includes('diamondview.aspx') ||   
          url.includes('gem360') ||             
          url.includes('sarine') ||             
          url.includes('360') ||                
          url.includes('3d') ||                 
          url.includes('rotate') ||             
          url.includes('.html') ||              // HTML viewers like yours
          url.match(/DAN\d+-\d+[A-Z]?\.jpg$/i);

        if (is360Url) {
          let processedUrl = url;
          if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = `https://${processedUrl}`;
          }
          
          console.log('✨ DETECTED 360° URL for', item.stock_number || item.stock || 'unknown', ':', processedUrl, 
            url.includes('my360.fab') ? '(🎯 YOUR my360.fab FORMAT DETECTED!)' : 
            url.includes('s3.eu-west-1.amazonaws.com') ? '(🎯 YOUR AWS S3 DOMAIN!)' : '');
          return processedUrl;
        }
      }
    }
    return undefined;
  }, []);

  // Regular image URL processing - exclude 360° URLs
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

    // Skip 360° viewers - these should go to gem360Url instead
    if (trimmedUrl.includes('.html') ||
        trimmedUrl.includes('diamondview.aspx') ||
        trimmedUrl.includes('v360.in') ||
        trimmedUrl.includes('my360.fab') ||
        trimmedUrl.includes('my360.sela') ||
        trimmedUrl.includes('sarine') ||
        trimmedUrl.includes('360') ||
        trimmedUrl.includes('3d') ||
        trimmedUrl.includes('rotate')) {
      console.log('🔄 SKIPPING 360° URL in image field (will be processed as 360°):', trimmedUrl);
      return undefined;
    }

    // Must be a valid HTTP/HTTPS URL
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return undefined;
    }

    // Accept common image extensions OR image service URLs
    const hasImageExtension = trimmedUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i);
    const isImageServiceUrl = trimmedUrl.includes('unsplash.com') || 
                             trimmedUrl.includes('/image') ||
                             trimmedUrl.includes('w=') || 
                             trimmedUrl.includes('h=');   

    if (hasImageExtension || isImageServiceUrl) {
      console.log('✅ VALID IMAGE URL processed:', trimmedUrl);
      return trimmedUrl;
    }

    return undefined;
  }, []);

  // Direct data transformation with enhanced media processing
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    console.log('🎯 PRIORITIZING YOUR my360.fab URLs...');
    
    const transformedData = rawData
      .map((item, index) => {
        // PHASE 1: Detect 360° URLs first (highest priority) - YOUR my360.fab format
        const final360Url = detect360Url(item);
        
        // PHASE 2: Process regular image URLs (excluding 360° URLs)
        let finalImageUrl = undefined;
        const imageFields = [
          item.picture,          // LIKELY YOUR MAIN IMAGE FIELD
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

        // Debug first few items with focus on your my360.fab URLs
        if (index < 3) {
          console.log(`🔧 TRANSFORM DEBUG [${index}]:`, {
            stockNumber: result.stockNumber,
            hasImage: !!result.imageUrl,
            has360: !!result.gem360Url,
            is_my360Fab: result.gem360Url?.includes('my360.fab'),
            is_your_S3: result.gem360Url?.includes('s3.eu-west-1.amazonaws.com'),
            gem360Url: result.gem360Url,
            price: result.price,
            priceSource: totalPrice > 0 ? 'total_price' : pricePerCarat > 0 ? 'calculated' : 'none'
          });
        }

        return result;
      })
      .filter(diamond => {
        // Only filter out if explicitly marked as not visible or unavailable
        const isVisible = diamond.store_visible !== false;
        const isAvailable = diamond.status === 'Available';
        
        if (!isVisible || !isAvailable) {
          console.log('🚫 FILTERED OUT:', diamond.stockNumber, { isVisible, isAvailable });
        }
        
        return isVisible && isAvailable;
      });

    const my360FabCount = transformedData.filter(d => d.gem360Url?.includes('my360.fab')).length;
    const yourS3Count = transformedData.filter(d => d.gem360Url?.includes('s3.eu-west-1.amazonaws.com')).length;
    
    console.log('🎯 FINAL TRANSFORM RESULT FOR YOUR DIAMONDS:', {
      originalCount: rawData.length,
      transformedCount: transformedData.length,
      filteredOut: rawData.length - transformedData.length,
      withImages: transformedData.filter(d => d.imageUrl).length,
      with360: transformedData.filter(d => d.gem360Url).length,
      withMy360Fab: my360FabCount,
      withYourS3Domain: yourS3Count,
      withPrices: transformedData.filter(d => d.price > 0).length
    });

    if (my360FabCount > 0 || yourS3Count > 0) {
      console.log('🎉 SUCCESS: Found', (my360FabCount + yourS3Count), 'diamonds with your 360° URLs!');
      console.log('🎯 my360.fab URLs:', my360FabCount);
      console.log('🎯 Your S3 domain URLs:', yourS3Count);
    } else {
      console.warn('⚠️ WARNING: No my360.fab or S3 360° URLs detected - check field mapping in FastAPI response');
      console.warn('🔍 Available fields in first item:', Object.keys(rawData[0] || {}));
    }

    return transformedData;
  }, [processImageUrl, detect360Url, parseNumber]);

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
