import { useState, useEffect, useCallback, useMemo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { fetchInventoryData } from '@/services/inventoryDataService';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';

export function useInventoryData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribeToInventoryChanges } = useInventoryDataSync();

  // Memoize shape normalization to prevent recalculation
  const normalizeShape = useMemo(() => {
    const shapeMap: Record<string, string> = {
      'round brilliant': 'Round',
      'round': 'Round',
      'br': 'Round', // From CSV - BR = Brilliant Round
      'princess': 'Princess',
      'ps': 'Princess', // From CSV
      'cushion': 'Cushion',
      'cu': 'Cushion', // From CSV
      'emerald': 'Emerald',
      'oval': 'Oval',
      'pear': 'Pear',
      'marquise': 'Marquise',
      'radiant': 'Radiant',
      'rad': 'Radiant', // From CSV
      'asscher': 'Asscher',
      'heart': 'Heart',
      'hs': 'Heart', // From CSV
      'tp': 'Trillion', // From CSV - TP = Trillion/Pear variant
      'bg': 'Baguette' // From CSV
    };
    
    return (apiShape: string): string => {
      if (!apiShape) return 'Round';
      const normalized = apiShape.toLowerCase().trim();
      return shapeMap[normalized] || apiShape.charAt(0).toUpperCase() + apiShape.slice(1).toLowerCase();
    };
  }, []);

  // Enhanced image URL processing - USE IMAGES DIRECTLY FROM FASTAPI
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

    // Accept ALL HTTP/HTTPS URLs directly from FastAPI - no filtering
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    return undefined;
  }, []);

  // Enhanced 360° URL detection - ACCEPT ALL FASTAPI URLS
  const detect360Url = useCallback((url: string | undefined): string | undefined => {
    if (!url || typeof url !== 'string') {
      return undefined;
    }

    const trimmedUrl = url.trim();
    
    // Skip invalid or placeholder values
    if (!trimmedUrl || 
        trimmedUrl === 'default' || 
        trimmedUrl === 'null' || 
        trimmedUrl === 'undefined' ||
        trimmedUrl.length < 10) {
      return undefined;
    }

    // Accept any valid HTTP/HTTPS URL that might be a 360° viewer with enhanced Segoma support
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      // Enhanced Segoma pattern detection (format: https://segoma.com/v.aspx?type=view&id=X)
      if (trimmedUrl.includes('segoma.com') || 
          trimmedUrl.includes('v.aspx') || 
          trimmedUrl.includes('type=view')) {
        console.log('✅ SEGOMA URL DETECTED:', trimmedUrl);
      }
      return trimmedUrl;
    }

    // If URL doesn't have protocol, add https
    if (trimmedUrl.includes('.') && !trimmedUrl.startsWith('http')) {
      return `https://${trimmedUrl}`;
    }

    return undefined;
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      console.log('📥 INVENTORY HOOK: Fetching FRESH inventory data (no cache)...');
      
      // SPECIAL DEBUG for user 2084882603 - Segoma issue
      if (String(user?.id) === '2084882603') {
        console.log('🔍 SEGOMA INVENTORY DEBUG for user 2084882603 - fetching data...');
      }
      
      // ALWAYS fetch fresh data - NO CACHING to ensure immediate updates
      const result = await fetchInventoryData();
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data && result.data.length > 0) {
        console.log('📥 INVENTORY HOOK: Processing', result.data.length, 'diamonds');
        
        // SPECIAL DEBUG for users 38166518 and 2084882603 - Segoma URL monitoring
        if (String(user?.id) === '2084882603' || String(user?.id) === '38166518') {
          console.log(`🔍 SEGOMA DEBUG for user ${user?.id}:`, {
            totalDiamonds: result.data.length,
            firstDiamond: result.data[0],
            segomaFields: result.data.slice(0, 5).map(item => ({
              stock: item.stock_number,
              '3D Link': item['3D Link'],
              segoma_url: item.segoma_url,
              segomaUrl: item.segomaUrl,
              gem360Url: item.gem360Url,
              isSegomaFormat: (item['3D Link'] || item.segoma_url || item.segomaUrl)?.includes('segoma.com/v.aspx')
            }))
          });
        }
        
        // Transform data to match Diamond interface with enhanced field mapping
        const transformedDiamonds = result.data.map(item => {
          // ENHANCED IMAGE URL PROCESSING - Accept ALL FastAPI image fields
          let finalImageUrl = undefined;
          const imageFields = [
            item.picture,          // Primary FastAPI image field
            item.image_url,        // Alternative FastAPI field
            item.imageUrl,         // CamelCase variant
            item.Image,            // CSV field
            item.image,            // Generic field
            item.photo_url,        // Photo URL field
            item.diamond_image,    // Diamond-specific image
            item.media_url,        // Media URL
            item.thumbnail_url,    // Thumbnail
            item.product_image,    // Product image
          ];
          
          // Accept FIRST valid image URL from FastAPI without strict filtering
          for (const imageField of imageFields) {
            const processedUrl = processImageUrl(imageField);
            if (processedUrl) {
              finalImageUrl = processedUrl;
              break;
            }
          }

          return {
            id: item.id || `${item.stock || item.stock_number || item.VendorStockNumber}-${Date.now()}`,
            diamondId: item.id || item.diamond_id,
            stockNumber: item.stock || item.stock_number || item.stockNumber || item.VendorStockNumber || '',
            shape: normalizeShape(item.shape || item.Shape),
            carat: parseFloat((item.weight || item.carat || item.Weight || 0).toString()) || 0,
            color: (item.color || item.Color || 'D').toUpperCase(),
            clarity: (item.clarity || item.Clarity || 'FL').toUpperCase(),
            cut: item.cut || item.Cut || item.Make || 'Excellent',
            polish: item.polish || item.Polish || undefined,
            symmetry: item.symmetry || item.Symmetry || undefined,
            price: (() => {
              const weight = parseFloat((item.weight || item.carat || item.Weight || 0).toString()) || 0;
              const rawPpc = Number(item.price_per_carat);
              const rawTotal = Number(item.price);
              
              // Use FastAPI price directly
              let totalPrice = 0;
              if (rawPpc > 0 && !isNaN(rawPpc) && weight > 0) {
                totalPrice = Math.round(rawPpc * weight);
              } else if (rawTotal > 0 && !isNaN(rawTotal)) {
                totalPrice = Math.round(rawTotal);
              }
              
              return Math.max(0, totalPrice);
            })(),
            status: item.status || item.Availability || 'Available',
            fluorescence: item.fluorescence || item.FluorescenceIntensity || undefined,
            imageUrl: finalImageUrl,
            // ENHANCED 360° URL PROCESSING - Accept ALL FastAPI 360 fields INCLUDING CSV "3D Link" and column letters like "aa"
            gem360Url: detect360Url(item['3D Link']) ||      // CSV Segoma field - HIGH PRIORITY
                       detect360Url(item['3DLink']) ||       // Alternative format
                       detect360Url(item['3d_link']) ||      // Snake case
                       detect360Url(item['aa']) ||           // Column letter field
                       detect360Url(item['AA']) ||
                       detect360Url(item['Aa']) ||
                       detect360Url(item['aA']) ||
                       detect360Url(item.segoma_url) ||      // Direct Segoma
                       detect360Url(item.segomaUrl) ||       // CamelCase Segoma
                       detect360Url(item.gem360Url) || 
                       detect360Url(item['Video link']) || 
                       detect360Url(item.videoLink) ||
                       detect360Url(item.video_url) ||
                       detect360Url(item.v360_url) ||
                       detect360Url(item.sarine_url) ||
                       detect360Url(item.three_d_url) ||
                       detect360Url(item.viewer_url) ||
                       undefined,
            store_visible: item.store_visible !== false,
            certificateNumber: item.certificate_number || 
                             item.certificateNumber || 
                             item.CertificateID || 
                             undefined,
            lab: item.lab || item.Lab || undefined,
            certificateUrl: item.certificate_url || item.certificateUrl || undefined,
          };
        });

        console.log('📥 INVENTORY HOOK: Transformed diamonds with image URLs:', 
          transformedDiamonds.map(d => ({ 
            stock: d.stockNumber, 
            imageUrl: d.imageUrl,
            gem360Url: d.gem360Url 
          }))
        );
        
        setDiamonds(transformedDiamonds);
        setAllDiamonds(transformedDiamonds);
      } else {
        console.log('📥 INVENTORY HOOK: No diamonds found');
        setDiamonds([]);
        setAllDiamonds([]);
      }
    } catch (err) {
      console.error('📥 INVENTORY HOOK: Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      setDiamonds([]);
      setAllDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [user, processImageUrl, detect360Url]);

  const handleRefresh = useCallback(() => {
    console.log('🔄 INVENTORY HOOK: Manual refresh triggered');
    fetchData();
  }, [fetchData]);

  // Initial load when user is available
  useEffect(() => {
    if (authLoading) {
      console.log('⏳ INVENTORY HOOK: Waiting for auth...');
      return;
    }
    
    if (user) {
      console.log('👤 INVENTORY HOOK: User available, fetching data for:', user.id);
      fetchData();
    } else {
      console.log('🚫 INVENTORY HOOK: No user, clearing data');
      setLoading(false);
      setDiamonds([]);
      setAllDiamonds([]);
      setError("Please log in to view your inventory.");
    }
  }, [user, authLoading, fetchData]);

  // Listen for inventory changes
  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      console.log('🔄 INVENTORY HOOK: Inventory change detected, refreshing...');
      fetchData();
    });

    return unsubscribe;
  }, [subscribeToInventoryChanges, fetchData]);

  return {
    diamonds,
    allDiamonds,
    loading: loading || authLoading,
    error,
    handleRefresh,
    fetchData,
  };
}
