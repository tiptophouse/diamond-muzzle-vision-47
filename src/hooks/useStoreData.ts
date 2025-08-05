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

  // SIMPLIFIED: Much more permissive image URL validation - accept almost any HTTP URL
  const processImageUrl = useCallback((imageUrl: string | undefined): string | undefined => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.log('❌ Invalid image input:', imageUrl);
      return undefined;
    }

    const trimmedUrl = imageUrl.trim();
    
    // Only skip completely empty or obvious invalid values
    if (!trimmedUrl || 
        trimmedUrl === 'default' || 
        trimmedUrl === 'null' || 
        trimmedUrl === 'undefined' ||
        trimmedUrl.length < 5) {
      console.log('❌ Skipping invalid URL:', trimmedUrl);
      return undefined;
    }

    // FIXED: Accept ANY HTTP/HTTPS URL - be very permissive
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      console.log('✅ ACCEPTING IMAGE URL:', trimmedUrl);
      return trimmedUrl;
    }

    // Try to fix URLs without protocol
    if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
      const fixedUrl = `https://${trimmedUrl}`;
      console.log('✅ FIXED URL (added https):', fixedUrl);
      return fixedUrl;
    }

    console.log('❌ REJECTED URL:', trimmedUrl);
    return undefined;
  }, []);

  // SIMPLIFIED: More permissive certificate image processing
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

    // Accept any HTTP/HTTPS URL for certificates
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      console.log('✅ CERTIFICATE IMAGE accepted:', trimmedUrl);
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

  // FIXED: Enhanced data transformation with better field mapping and more logging
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    console.log('🔧 TRANSFORM DATA: Processing', rawData.length, 'items from FastAPI');
    console.log('🔧 FIRST RAW ITEM:', rawData[0]);
    
    return rawData
      .map(item => {
        console.log('🔍 PROCESSING ITEM:', {
          stock: item.stock_number || item.stock,
          picture: item.picture,
          image_url: item.image_url,
          imageUrl: item.imageUrl
        });
        
        // PRIORITY ORDER: Try all possible image fields
        let finalImageUrl = undefined;
        const imageFields = [
          item.picture,           // PRIMARY: Your API uses 'picture' field
          item.image_url,         // Fallback 1
          item.imageUrl,          // Fallback 2
          item.Image,             // Fallback 3
          item.image,             // Fallback 4
        ];
        
        for (const imageField of imageFields) {
          console.log(`🔍 Checking image field:`, imageField);
          const processedUrl = processImageUrl(imageField);
          if (processedUrl) {
            finalImageUrl = processedUrl;
            console.log('✅ FOUND VALID IMAGE for', item.stock_number || item.stock, ':', finalImageUrl);
            break;
          }
        }
        
        if (!finalImageUrl) {
          console.log('❌ NO VALID IMAGE found for', item.stock_number || item.stock, 'from fields:', imageFields);
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

        console.log('✅ FINAL RESULT for', result.stockNumber, ':', {
          hasImage: !!result.imageUrl,
          imageUrl: result.imageUrl,
          originalPicture: item.picture,
          has360: !!result.gem360Url,
          hasCertificateImage: !!result.certificateImageUrl
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
        console.log('📦 Using cached data');
        setDiamonds(dataCache.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('🚀 FETCHING STORE DATA...');

      const result = await fetchInventoryData();
      
      console.log('🚨 RAW API RESPONSE DETAILED:', {
        hasData: !!result.data,
        dataLength: result.data?.length || 0,
        error: result.error,
        sampleItems: result.data?.slice(0, 2).map(item => ({
          id: item.id,
          stock: item.stock_number || item.stock,
          picture: item.picture,
          shape: item.shape,
          carat: item.weight || item.carat,
          price: item.price
        }))
      });

      if (result.error) {
        console.error('❌ API ERROR:', result.error);
        setError(result.error);
        setDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        console.log('🔧 Starting transformation...');
        const transformedDiamonds = transformData(result.data);
        
        const diamondsWithImages = transformedDiamonds.filter(d => d.imageUrl);
        const diamondsWith360 = transformedDiamonds.filter(d => d.gem360Url);
        
        console.log('📊 FINAL SUMMARY:', {
          totalDiamonds: transformedDiamonds.length,
          diamondsWithImages: diamondsWithImages.length,
          diamondsWith360: diamondsWith360.length,
          sampleWithImages: diamondsWithImages.slice(0, 3).map(d => ({ 
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
        console.log('❌ No data received from API');
        setDiamonds([]);
      }
    } catch (err) {
      console.error('❌ FETCH ERROR:', err);
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
      console.log('👤 User authenticated, fetching store data');
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
        console.log('🔄 Inventory changed, refetching...');
        dataCache = null;
        fetchStoreData(false);
      }
    });
  }, [user, authLoading, subscribeToInventoryChanges, fetchStoreData]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
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
