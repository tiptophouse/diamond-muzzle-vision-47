import { useState, useEffect, useMemo, useCallback } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryDataSync } from "./inventory/useInventoryDataSync";
import { getTelegramWebApp } from "@/utils/telegramWebApp";
import { detectFancyColor } from "@/utils/fancyColorUtils";
import { useTelegramCloudCache } from "./useTelegramCloudCache";

// Telegram memory management
const tg = getTelegramWebApp();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useStoreData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // CloudStorage cache for persistent caching across sessions
  const cloudCache = useTelegramCloudCache<Diamond[]>('diamond_inventory', {
    ttl: CACHE_DURATION,
    compression: true
  });

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
  const detect360Url = useCallback((item: any): string | undefined => {
    // All possible fields that might contain 360° URLs - INCLUDING CSV "3D Link" field
    const potential360Fields = [
      item['3D Link'],        // CSV field for Segoma URLs - HIGH PRIORITY
      item['3DLink'],         // Alternative format
      item['3d_link'],        // Snake case variant
      item['aa'],             // CSV column letter reference
      item['AA'],
      item['Aa'],
      item['aA'],
      item.segoma_url,        // Direct Segoma field
      item.segomaUrl,         // CamelCase Segoma
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
    
    const is360Candidate = (url: string) => (
      url.includes('segoma.com') ||         // HIGH PRIORITY: Segoma detection
      url.includes('v.aspx') ||             // HIGH PRIORITY: Segoma viewer pattern
      url.includes('type=view') ||          // HIGH PRIORITY: Segoma parameter
      /segoma\.com.*v\.aspx/.test(url) || // HIGH PRIORITY: Segoma regex pattern
      url.includes('my360.fab') ||          
      url.includes('my360.sela') ||         
      url.includes('v360.in') ||            
      url.includes('diamondview.aspx') ||   
      url.includes('gem360') ||             
      url.includes('sarine') ||             
      url.includes('360') ||                
      url.includes('3d') ||                 
      url.includes('rotate') ||             
      url.includes('.html') ||              
      url.match(/DAN\d+-\d+[A-Z]?\.jpg$/i) !== null
    );
    
    const normalize = (raw: string) => {
      let processed = raw.trim();
      if (!processed.startsWith('http://') && !processed.startsWith('https://')) {
        processed = `https://${processed}`;
      }
      return processed;
    };
    
    // 1) Check known fields first (fast path)
    for (const field of potential360Fields) {
      if (field && typeof field === 'string' && field.trim()) {
        const url = field.trim();
        if (is360Candidate(url)) {
          return normalize(url);
        }
      }
    }

    // 2) Fallback: scan ALL string fields in the record (handles unknown CSV headers)
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'string' && value.trim()) {
        const url = value.trim();
        if (is360Candidate(url)) {
          console.log('✅ Fallback 360° URL detected from arbitrary field', { key, url });
          return normalize(url);
        }
      }
    }

    return undefined;
  }, []);

  // Regular image URL processing - exclude 360° viewers but not S3 URLs with "360" in path
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

    // Must be a valid HTTP/HTTPS URL first
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return undefined;
    }

    // Check if it's a valid image file (jpg, jpeg, png, webp, gif)
    const hasImageExtension = trimmedUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i);
    
    // If it has an image extension, it's a regular image - accept it even if path contains "360"
    if (hasImageExtension) {
      return trimmedUrl;
    }

    // For URLs without image extensions, check if they're 360° viewers
    if (trimmedUrl.includes('.html') ||
        trimmedUrl.includes('diamondview.aspx') ||
        trimmedUrl.includes('v360.in') ||
        trimmedUrl.includes('my360.fab') ||
        trimmedUrl.includes('my360.sela') ||
        trimmedUrl.includes('segoma.com') ||
        trimmedUrl.includes('sarine') ||
        trimmedUrl.includes('360') ||
        trimmedUrl.includes('3d') ||
        trimmedUrl.includes('rotate')) {
      return undefined;
    }

    // Accept image service URLs without extensions
    const isImageServiceUrl = trimmedUrl.includes('unsplash.com') || 
                             trimmedUrl.includes('/image') ||
                             trimmedUrl.includes('w=') || 
                             trimmedUrl.includes('h=');   

    if (isImageServiceUrl) {
      return trimmedUrl;
    }

    return undefined;
  }, []);

  // Direct data transformation with enhanced media processing
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    
    const transformedData = rawData
      .map((item, index) => {
        // PHASE 1: Detect 360° URLs first (highest priority)
        const final360Url = detect360Url(item);
        
        // ENHANCED DEBUGGING for 360° detection - User 2084882603 focus
        if (item.stock_number === '105604' || String(item.id).includes('105604') || 
            item['3D Link']?.includes('segoma.com') || item['aa']?.includes('segoma.com')) {
          console.log('🔍 USER 2084882603 DIAMOND DEBUG:', {
            stock_number: item.stock_number,
            '3D Link': item['3D Link'],
            'aa column': item['aa'],
            'AA column': item['AA'], 
            segoma_url: item.segoma_url,
            final360Url: final360Url,
            allSegomaFields: {
              '3D Link': item['3D Link'],
              'aa': item['aa'],
              'AA': item['AA'],
              'segoma_url': item.segoma_url
            },
            csvFieldsCount: Object.keys(item).length,
            hasSegomaInAnyField: Object.values(item).some(val => 
              typeof val === 'string' && val.includes('segoma.com')
            )
          });
        }
        
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
        
        // Best practice: Consistent price calculation matching backend expectations
        let finalPrice = 0;
        
        // Priority 1: Use total price if available and positive
        if (totalPrice > 0) {
          finalPrice = Math.round(totalPrice);
        } 
        // Priority 2: Calculate from price per carat if available
        else if (pricePerCarat > 0 && weight > 0) {
          finalPrice = Math.round(pricePerCarat * weight);
        }
        
        // Ensure non-negative values
        finalPrice = Math.max(0, finalPrice);

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
          // Preserve original CSV image fields for sharing functionality
          Image: item.Image || item.picture || undefined,
          image: item.image || undefined,
          picture: item.picture || undefined,
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
  }, [processImageUrl, detect360Url, parseNumber]);

  const fetchStoreData = useCallback(async (useCache = true) => {
    try {
      setError(null);
      
      console.log('🔍 STORE DATA: Starting fetch process');
      
      // Wait for user authentication before making API calls
      if (!user) {
        console.log('⏳ STORE DATA: Waiting for user authentication');
        setError('Please log in to view your diamonds');
        setDiamonds([]);
        setLoading(false);
        return;
      }

      // Try CloudStorage cache first (persistent across sessions)
      if (useCache && cloudCache.data && cloudCache.isFresh) {
        console.log('⚡ STORE DATA: Using CloudStorage cached data');
        setDiamonds(cloudCache.data);
        setLoading(false);
        
        // Refresh in background
        if (!cloudCache.isRefreshing) {
          console.log('🔄 STORE DATA: Refreshing cache in background');
          setTimeout(() => fetchStoreData(false), 100);
        }
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

      // SPECIAL DEBUG for user 2084882603 - Segoma issue
      if (String(user?.id) === '2084882603' && result.data?.length > 0) {
        console.log('🔍 SEGOMA DEBUG for user 2084882603:', {
          totalDiamonds: result.data.length,
          firstDiamond: result.data[0],
          segoma3DLinks: result.data.map(item => ({
            stock: item.stock_number,
            '3D Link': item['3D Link'],
            segoma_url: item.segoma_url,
            picture: item.picture
          }))
        });
      }

      if (result.error) {
        setError(result.error);
        setDiamonds([]);
        return;
      }

        if (result.data && result.data.length > 0) {
          const transformedDiamonds = transformData(result.data);
          
          // ENHANCED DEBUGGING for transformed data
          console.log('🔍 STORE DATA TRANSFORMED:', {
            totalDiamonds: transformedDiamonds.length,
            diamondsWithImages: transformedDiamonds.filter(d => d.imageUrl || d.gem360Url).length,
            segomaDiamonds: transformedDiamonds.filter(d => 
              d.gem360Url?.includes('segoma.com') || d.imageUrl?.includes('segoma.com')
            ),
            user2084882603Diamonds: transformedDiamonds.filter(d => d.stockNumber === '105604')
          });
          
          // Save to CloudStorage for persistent caching
          await cloudCache.save(transformedDiamonds);
          console.log('💾 STORE DATA: Saved to CloudStorage cache');

        setDiamonds(transformedDiamonds);
      } else {
        setDiamonds([]);
        await cloudCache.clear();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load store diamonds';
      setError(errorMessage);
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [transformData, user, cloudCache]);

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
      console.log('⏳ STORE DATA: Auth loading, waiting...');
      return;
    }
    
    if (user) {
      console.log('✅ STORE DATA: User authenticated, fetching data');
      fetchStoreData();
    } else {
      console.log('❌ STORE DATA: No user, clearing data');
      setLoading(false);
      setDiamonds([]);
      setError("Please log in to view your diamonds");
    }
  }, [user, authLoading, fetchStoreData]);

  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      console.log('🔄 STORE DATA: Inventory change detected');
      if (user && !authLoading) {
        console.log('🔄 STORE DATA: Refreshing data after inventory change');
        cloudCache.clear(); // Clear CloudStorage cache
        fetchStoreData(false);
      }
    });

    return unsubscribe;
  }, [user, authLoading, subscribeToInventoryChanges, fetchStoreData, cloudCache]);

  const refetch = useCallback(() => {
    console.log('🔄 STORE DATA: Manual refetch requested');
    cloudCache.clear(); // Clear CloudStorage cache
    return fetchStoreData(false);
  }, [fetchStoreData, cloudCache]);

  return {
    diamonds,
    loading: loading || authLoading,
    error,
    refetch,
  };
}
