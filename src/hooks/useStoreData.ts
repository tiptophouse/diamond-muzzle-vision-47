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

  // Relaxed image URL validation for better compatibility
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

    // Skip HTML viewers and 360° URLs (these go to gem360Url instead)
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

    // Accept common image extensions OR unsplash/image URLs
    const hasImageExtension = trimmedUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i);
    const isImageUrl = trimmedUrl.includes('unsplash.com') || 
                      trimmedUrl.includes('/image') ||
                      trimmedUrl.includes('w=') || // Unsplash width parameter
                      trimmedUrl.includes('h='); // Unsplash height parameter

    if (hasImageExtension || isImageUrl) {
      console.log('✅ VALID IMAGE URL processed:', trimmedUrl);
      return trimmedUrl;
    }

    return undefined;
  }, []);

  // PHASE 2: Enhanced 360° URL detection for ALL possible 3D/360° field names
  const detect360Url = useCallback((item: any) => {
    const potential360Fields = [
      item.v360_url,
      item.gem360_url,
      item.video_url,
      item.video360_url,
      item.three_d_url,
      item.rotation_url,
      item['Video link'],        // Spaced field name from CSV
      item.videoLink,            // Camel case video
      item.video_link,           // Snake case video
      item.view360_url,          // View 360 URL
      item.view360Url,           // Camel case view 360
      item.viewer_url,           // Viewer URL
      item.viewerUrl,            // Camel case viewer
      item.threed_url,           // 3D URL
      item.threedUrl,            // Camel case 3D
      item['3d_url'],            // 3D with number
      item['3dUrl'],             // Camel case 3D with number
      item.sarine_url,           // Sarine URL
      item.sarineUrl,            // Camel case Sarine
      item.diamond_viewer,       // Diamond viewer
      item.diamondViewer,        // Camel case diamond viewer
      item.interactive_view,     // Interactive view
      item.interactiveView,      // Camel case interactive
      item.certificate_url,      // Sometimes certificates have 360° views
      item.certificateUrl,       // Camel case certificate
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

  // Direct data transformation with enhanced image processing
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    
    return rawData
      .map(item => {
  // PHASE 1: Enhanced image URL detection with ALL possible field names
        let finalImageUrl = undefined;
        const imageFields = [
          item.picture,          // Primary field from FastAPI
          item.imageUrl,         // Alternative field
          item.image_url,        // Snake case variant
          item.Image,            // CSV field (capitalized)
          item.image,            // Generic field
          item.photo_url,        // Photo URL variant
          item.photoUrl,         // Camel case photo
          item.diamond_image,    // Specific diamond image
          item.diamondImage,     // Camel case diamond image
          item.media_url,        // Media URL
          item.mediaUrl,         // Camel case media
          item.img_url,          // Image URL variant
          item.imgUrl,           // Camel case img
          item.photo,            // Simple photo field
          item.img,              // Simple img field
          item.thumbnail_url,    // Thumbnail URL
          item.thumbnailUrl,     // Camel case thumbnail
          item.product_image,    // Product image
          item.productImage,     // Camel case product image
        ];
        
        console.log('🔍 IMAGE SEARCH for', item.stock_number || item.stock || 'unknown', ':', {
          picture: item.picture,
          imageUrl: item.imageUrl,
          image_url: item.image_url,
          Image: item.Image,
          image: item.image
        });
        
        // Process each potential image field
        for (const imageField of imageFields) {
          const processedUrl = processImageUrl(imageField);
          if (processedUrl) {
            finalImageUrl = processedUrl;
            console.log('✅ FOUND VALID IMAGE for', item.stock_number || item.stock, ':', finalImageUrl);
            break;
          }
        }
        
        // PHASE 2: Enhanced 360° URL detection with priority logging
        const final360Url = detect360Url(item);
        
        // PHASE 3: Generate fallback placeholder if no media available
        let fallbackImageUrl = finalImageUrl;
        if (!finalImageUrl && !final360Url) {
          // Generate a placeholder image with diamond info
          const placeholderParams = new URLSearchParams({
            text: `${item.carat || '?'}ct ${item.shape || 'Diamond'}`,
            color: item.color || 'D',
            clarity: item.clarity || 'FL',
            stock: item.stock_number || item.stock || 'N/A'
          });
          fallbackImageUrl = `https://via.placeholder.com/400x300/f8fafc/64748b?text=${encodeURIComponent(`${item.carat || '?'}ct ${item.shape || 'Diamond'}`)}`;
          console.log('🎨 GENERATED FALLBACK for', item.stock_number || item.stock, ':', fallbackImageUrl);
        }

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
          imageUrl: fallbackImageUrl,
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
      .filter(diamond => diamond.store_visible && diamond.status === 'Available');
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
