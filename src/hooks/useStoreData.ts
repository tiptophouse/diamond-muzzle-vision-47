import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  const hasDataRef = useRef(false);

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

  // Optimized 360° URL detection - check high-priority fields only
  const detect360Url = useCallback((item: any): string | undefined => {
    // Fast check for high-priority fields only (most common cases)
    const quickFields = [
      item['3D Link'], item['3DLink'], item['3d_link'],
      item.segoma_url, item.segomaUrl, item.gem360_url, 
      item.v360_url, item.video_url
    ];
    
    for (const field of quickFields) {
      if (field && typeof field === 'string' && field.length > 10) {
        const url = field.trim();
        if (url.includes('segoma.com') || url.includes('v360.in') || 
            url.includes('my360.fab') || url.includes('.html')) {
          return url.startsWith('http') ? url : `https://${url}`;
        }
      }
    }
    return undefined;
  }, []);

  // Optimized image URL processing
  const processImageUrl = useCallback((imageUrl: string | undefined): string | undefined => {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.length < 10) return undefined;
    const url = imageUrl.trim();
    if (!url.startsWith('http')) return undefined;
    
    // Quick check: if it has image extension, accept it
    if (/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url)) return url;
    
    // Quick reject: known 360° patterns
    if (url.includes('.html') || url.includes('segoma.com') || url.includes('v360.in')) return undefined;
    
    return undefined;
  }, []);

  // Optimized data transformation
  const transformData = useCallback((rawData: any[]): Diamond[] => {
    return rawData
      .map((item, index) => {
        // Quick 360° URL check
        const final360Url = detect360Url(item);
        
        // Quick image URL check (only first 3 common fields)
        const finalImageUrl = processImageUrl(item.picture) || 
                             processImageUrl(item.imageUrl) || 
                             processImageUrl(item.image_url);

        // Fast price calculation
        const weight = parseNumber(item.weight || item.carat || 0);
        const pricePerCarat = parseNumber(item.price_per_carat || 0);
        const totalPrice = parseNumber(item.price || 0);
        const finalPrice = totalPrice > 0 ? totalPrice : (pricePerCarat * weight);

        return {
          id: String(item.id || `diamond_${index}`),
          stockNumber: String(item.stock_number || item.stock || `STOCK_${index}`),
          shape: item.shape || 'Round',
          carat: weight,
          color: item.color || 'D',
          color_type: (item.color_type || 'Standard') as 'Fancy' | 'Standard',
          clarity: item.clarity || 'FL',
          cut: item.cut || 'Excellent',
          polish: item.polish,
          symmetry: item.symmetry,
          price: Math.max(0, Math.round(finalPrice)),
          status: item.status || 'Available',
          imageUrl: finalImageUrl,
          gem360Url: final360Url,
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number,
          lab: item.lab,
          certificateUrl: item.certificate_url,
          Image: item.Image || item.picture,
          image: item.image,
          picture: item.picture,
        };
      })
      .filter(d => d.store_visible !== false && d.status === 'Available');
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

      if (useCache && dataCache && (Date.now() - dataCache.timestamp) < CACHE_DURATION) {
        console.log('✅ STORE DATA: Using cached data');
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
          dataCache = { data: transformedDiamonds, timestamp: Date.now() };
          setDiamonds(transformedDiamonds);
          hasDataRef.current = true; // Mark that we have data
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
  }, [transformData, user]);

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
      // CRITICAL: Only clear data if we've never loaded data before
      // This prevents race condition where auth temporarily returns null during refresh
      if (!hasDataRef.current) {
        console.log('❌ STORE DATA: No user and no previous data, showing error');
        setLoading(false);
        setError("Please log in to view your diamonds");
      } else {
        console.log('⚠️ STORE DATA: No user but keeping cached data to prevent flicker');
        setLoading(false);
      }
    }
  }, [user, authLoading, fetchStoreData]);

  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      console.log('🔄 STORE DATA: Inventory change detected');
      if (user && !authLoading) {
        console.log('🔄 STORE DATA: Refreshing data after inventory change');
        dataCache = null; // Clear cache to force fresh fetch
        fetchStoreData(false);
      }
    });

    return unsubscribe;
  }, [user, authLoading, subscribeToInventoryChanges, fetchStoreData]);

  const refetch = useCallback(() => {
    console.log('🔄 STORE DATA: Manual refetch requested');
    dataCache = null; // Clear cache to force fresh fetch
    return fetchStoreData(false);
  }, [fetchStoreData]);

  return {
    diamonds,
    loading: loading || authLoading,
    error,
    refetch,
  };
}
