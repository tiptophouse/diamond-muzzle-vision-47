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

  // Enhanced 360° URL detection with priority for my360.fab and HTML viewers
  const detect360Url = useCallback((item: any): string | undefined => {
    // All possible fields that might contain 360° URLs
    const potential360Fields = [
      item.picture,           // Primary field that might contain 360° URLs
      item.image_url,         // Secondary image field
      item.imageUrl,          // Camel case image field
      item.img_url,           // Image URL variant
      item.imgUrl,            // Camel case img field
      item.v360_url,          // Dedicated 360° field
      item.gem360_url,        // Gem 360° field
      item.video_url,         // Video field (might be 360°)
      item.video360_url,      // Video 360° field
      item.three_d_url,       // 3D URL field
      item.rotation_url,      // Rotation URL field
      item['Video link'],     // Spaced field name from CSV
      item.videoLink,         // Camel case video
      item.video_link,        // Snake case video
      item.view360_url,       // View 360 URL
      item.view360Url,        // Camel case view 360
      item.viewer_url,        // Viewer URL
      item.viewerUrl,         // Camel case viewer
      item.threed_url,        // 3D URL
      item.threedUrl,         // Camel case 3D
      item['3d_url'],         // 3D with number
      item['3dUrl'],          // Camel case 3D with number
      item.sarine_url,        // Sarine URL
      item.sarineUrl,         // Camel case Sarine
      item.diamond_viewer,    // Diamond viewer
      item.diamondViewer,     // Camel case diamond viewer
      item.interactive_view,  // Interactive view
      item.interactiveView,   // Camel case interactive
    ];
    
    for (const field of potential360Fields) {
      if (field && typeof field === 'string' && field.trim()) {
        const url = field.trim();
        
        // Enhanced detection patterns for 360° formats
        const is360Url = 
          url.includes('my360.fab') ||          // Your specific provider
          url.includes('my360.sela') ||         // Another 360° provider
          url.includes('v360.in') ||            // v360 platform
          url.includes('diamondview.aspx') ||   // Diamond view platform
          url.includes('gem360') ||             // Gem360 platform
          url.includes('sarine') ||             // Sarine platform
          url.includes('360') ||                // Generic 360° indicator
          url.includes('3d') ||                 // 3D indicator
          url.includes('rotate') ||             // Rotation indicator
          url.includes('.html') ||              // HTML viewers (like your example)
          url.match(/DAN\d+-\d+[A-Z]?\.jpg$/i); // Pattern like DAN040-0016A.jpg

        if (is360Url) {
          // Ensure proper protocol
          let processedUrl = url;
          if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = `https://${processedUrl}`;
          }
          
          console.log('✨ DETECTED 360° URL for', item.stock_number || item.stock || 'unknown', ':', processedUrl);
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
      console.log('🔄 SKIPPING 360° URL in image field:', trimmedUrl);
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
                             trimmedUrl.includes('w=') || // Width parameter
                             trimmedUrl.includes('h=');   // Height parameter

    if (hasImageExtension || isImageServiceUrl) {
      console.log('✅ VALID IMAGE URL processed:', trimmedUrl);
      return trimmedUrl;
    }

    return undefined;
  }, []);

  // Direct data transformation with enhanced media processing
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    
    return rawData
      .map(item => {
        // PHASE 1: Detect 360° URLs first (highest priority)
        const final360Url = detect360Url(item);
        
        // PHASE 2: Process regular image URLs (excluding 360° URLs)
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
        
        console.log('🔍 MEDIA SEARCH for', item.stock_number || item.stock || 'unknown', ':', {
          has360: !!final360Url,
          gem360Url: final360Url,
          picture: item.picture,
          imageUrl: item.imageUrl,
          image_url: item.image_url,
        });
        
        // Process each potential image field (only if no 360° URL found or for additional images)
        for (const imageField of imageFields) {
          const processedUrl = processImageUrl(imageField);
          if (processedUrl) {
            finalImageUrl = processedUrl;
            console.log('✅ FOUND VALID IMAGE for', item.stock_number || item.stock, ':', finalImageUrl);
            break;
          }
        }
        
        // PHASE 3: Generate fallback placeholder if no media available
        let fallbackImageUrl = finalImageUrl;
        if (!finalImageUrl && !final360Url) {
          // Generate a placeholder image with diamond info
          const stockText = item.stock_number || item.stock || 'Diamond';
          const caratText = item.carat || item.weight || '?';
          const shapeText = item.shape || 'Round';
          fallbackImageUrl = `https://via.placeholder.com/400x300/f8fafc/64748b?text=${encodeURIComponent(`${caratText}ct ${shapeText}`)}`;
          console.log('🎨 GENERATED FALLBACK for', stockText, ':', fallbackImageUrl);
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
          mediaType: result.gem360Url ? '360°/HTML' : result.imageUrl ? 'Image' : 'Placeholder',
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
        
        const diamondsWithImages = transformedDiamonds.filter(d => d.imageUrl && !d.imageUrl.includes('placeholder'));
        const diamondsWith360 = transformedDiamonds.filter(d => d.gem360Url);
        const diamondsWithMy360 = transformedDiamonds.filter(d => d.gem360Url && d.gem360Url.includes('my360.fab'));
        
        console.log('🖼️ TRANSFORM SUMMARY:', {
          totalDiamonds: transformedDiamonds.length,
          diamondsWithImages: diamondsWithImages.length,
          diamondsWith360: diamondsWith360.length,
          diamondsWithMy360: diamondsWithMy360.length,
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
