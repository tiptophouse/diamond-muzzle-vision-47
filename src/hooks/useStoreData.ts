
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

  // FIXED: Simplified and more permissive image URL validation
  const processImageUrl = useCallback((imageUrl: string | undefined): string | undefined => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return undefined;
    }

    const trimmedUrl = imageUrl.trim();
    
    // Skip obvious invalid values
    if (!trimmedUrl || 
        trimmedUrl === 'default' || 
        trimmedUrl === 'null' || 
        trimmedUrl === 'undefined' ||
        trimmedUrl.length < 5) {
      return undefined;
    }

    // FIXED: Accept any HTTP/HTTPS URL - don't be too strict about extensions
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      console.log('✅ VALID IMAGE URL accepted:', trimmedUrl);
      return trimmedUrl;
    }

    return undefined;
  }, []);

  // FIXED: More permissive certificate image processing
  const processCertificateImage = useCallback((certificateUrl: string | undefined): string | undefined => {
    if (!certificateUrl || typeof certificateUrl !== 'string') {
      return undefined;
    }

    const trimmedUrl = certificateUrl.trim();
    
    if (!trimmedUrl || 
        trimmedUrl === 'default' || 
        trimmedUrl === 'null' || 
        trimmedUrl === 'undefined' ||
        trimmedUrl.length < 5) {
      return undefined;
    }

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      console.log('✅ VALID CERTIFICATE IMAGE accepted:', trimmedUrl);
      return trimmedUrl;
    }

    return undefined;
  }, []);

  // Enhanced 360° URL detection for various formats
  const detect360Url = useCallback((item: any) => {
    const potential360Fields = [
      item.gem360Url,
      item.gem360_url,
      item.v360_url,
      item.video_url,
      item.video360_url,
      item.three_d_url,
      item.rotation_url,
      item['Video link'],
      item.videoLink
    ];
    
    for (const field of potential360Fields) {
      if (field && typeof field === 'string' && field.trim()) {
        const url = field.trim();
        if (url !== 'default' && url !== 'null' && url.length > 5) {
          console.log('✨ DETECTED 360° URL for', item.stock_number || item.stock, ':', url);
          return url;
        }
      }
    }
    return undefined;
  }, []);

  // FIXED: More comprehensive data transformation with better field mapping
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    
    return rawData
      .map(item => {
        console.log('🔍 PROCESSING ITEM:', item.stock_number || item.stock, 'with picture:', item.picture);
        
        // FIXED: Try multiple image fields in order of priority
        let finalImageUrl = undefined;
        const imageFields = [
          item.picture,           // Your API uses 'picture' field
          item.image_url,
          item.imageUrl,
          item.Image,
          item.image,
        ];
        
        for (const imageField of imageFields) {
          const processedUrl = processImageUrl(imageField);
          if (processedUrl) {
            finalImageUrl = processedUrl;
            console.log('✅ FOUND VALID IMAGE for', item.stock_number || item.stock, ':', finalImageUrl);
            break;
          }
        }
        
        // Certificate image detection
        let finalCertificateImageUrl = undefined;
        const certificateImageFields = [
          item.certificate_image_url,
          item.certificateImageUrl,
          item.certificate_url,
          item.certificateUrl,
          item.gia_report_image,
          item.lab_report_image,
        ];
        
        for (const certField of certificateImageFields) {
          const processedCertUrl = processCertificateImage(certField);
          if (processedCertUrl) {
            finalCertificateImageUrl = processedCertUrl;
            break;
          }
        }

        // Enhanced 360° URL detection
        const final360Url = detect360Url(item);

        // Determine color type
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
          certificateUrl: item.certificate_url || item.certificateUrl || undefined,
          certificateImageUrl: finalCertificateImageUrl,
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number || undefined,
          lab: item.lab || undefined,
        };

        console.log('🔧 FINAL TRANSFORM for', result.stockNumber, ':', {
          hasImage: !!result.imageUrl,
          has360: !!result.gem360Url,
          hasCertificateImage: !!result.certificateImageUrl,
          imageUrl: result.imageUrl,
          originalPicture: item.picture
        });

        return result;
      })
      .filter(diamond => diamond.store_visible && diamond.status === 'Available');
  }, [processImageUrl, detect360Url, processCertificateImage]);

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
        firstItemPicture: result.data?.[0]?.picture
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
          sampleImageUrls: diamondsWithImages.slice(0, 3).map(d => ({ stock: d.stockNumber, url: d.imageUrl }))
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
