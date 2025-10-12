import { useState, useEffect, useCallback, useMemo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { fetchInventoryData } from '@/services/inventoryDataService';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useRequestCache } from '@/hooks/useRequestCache';

export function useInventoryData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const inventoryCache = useRequestCache<Diamond[]>({ ttl: 2 * 60 * 1000 }); // 2 minutes cache

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
        trimmedUrl.length < 3) { // Changed from 10 to 3 to allow shorter paths
      return undefined;
    }

    // Accept ALL HTTP/HTTPS URLs directly from FastAPI - no filtering
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    // Handle relative URLs - prepend FastAPI base URL
    if (trimmedUrl.startsWith('/')) {
      return `https://api.mazalbot.com${trimmedUrl}`;
    }
    
    // Handle URLs without protocol but with domain
    if (trimmedUrl.includes('.') && trimmedUrl.includes('/')) {
      return `https://${trimmedUrl}`;
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
      // Enhanced Segoma pattern detection
      if (trimmedUrl.includes('segoma.com') || 
          trimmedUrl.includes('v.aspx') || 
          trimmedUrl.includes('type=view')) {
        console.log('🔍 SEGOMA URL DETECTED in inventory:', trimmedUrl);
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

      const cacheKey = `inventory_${user.id}`;
      
      console.log('📥 INVENTORY HOOK: Fetching inventory data...');
      
      // SPECIAL DEBUG for user 2084882603 - Segoma issue
      if (String(user?.id) === '2084882603') {
        console.log('🔍 SEGOMA INVENTORY DEBUG for user 2084882603 - fetching data...');
      }
      
      const transformedDiamonds = await inventoryCache.getOrFetch(cacheKey, async () => {
        const result = await fetchInventoryData();
        
        if (result.error) {
          throw new Error(result.error);
        }

        if (result.data && result.data.length > 0) {
          console.log('📥 INVENTORY HOOK: Processing', result.data.length, 'diamonds');
          
          // SPECIAL DEBUG for user 2084882603 - Segoma issue
          if (String(user?.id) === '2084882603') {
            console.log('🔍 SEGOMA INVENTORY DEBUG for user 2084882603:', {
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
          
          // Transform data to match Diamond interface with enhanced field mapping
          return result.data.map(item => {
            // ENHANCED IMAGE URL PROCESSING - Accept ALL FastAPI image fields (case-insensitive)
            let finalImageUrl = undefined;
            const imageFields = [
              item.picture || item.Picture || item.PICTURE,          // Primary FastAPI image field
              item.image_url || item.ImageURL || item.IMAGE_URL,     // Alternative FastAPI field
              item.imageUrl || item.ImageUrl || item.imageURL,       // CamelCase variant
              item.Image || item.IMAGE,                              // CSV field
              item.image,                                            // Generic field
              item.photo_url || item.PhotoURL,                       // Photo URL field
              item.diamond_image || item.DiamondImage,               // Diamond-specific image
              item.media_url || item.MediaURL,                       // Media URL
              item.thumbnail_url || item.ThumbnailURL,               // Thumbnail
              item.product_image || item.ProductImage,               // Product image
            ];
            
            // Special diagnostic for Adam Knipel
            if (String(user?.id) === '38166518') {
              console.log('🚨 ADAM KNIPEL IMAGE PROCESSING:', {
                stockNumber: item.stock || item.stock_number,
                allKeys: Object.keys(item),
                imageFieldsRaw: imageFields.filter(f => f),
                imageFieldsChecked: imageFields.map((field, idx) => ({
                  index: idx,
                  value: field,
                  processed: processImageUrl(field)
                }))
              });
            }
            
            // Accept FIRST valid image URL from FastAPI without strict filtering
            for (const imageField of imageFields) {
              const processedUrl = processImageUrl(imageField);
              if (processedUrl) {
                finalImageUrl = processedUrl;
                break;
              }
            }
            
            // Additional diagnostic for Adam Knipel
            if (String(user?.id) === '38166518') {
              console.log('🚨 ADAM KNIPEL FINAL IMAGE URL:', {
                stockNumber: item.stock || item.stock_number,
                finalImageUrl: finalImageUrl
              });
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
              price: Number(
                item.price_per_carat ? 
                  item.price_per_carat * (item.weight || item.carat || item.Weight) : 
                  item.price || item.Price || item.RapnetAskingPrice || item.IndexAskingPrice || 0
              ) || 0,
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
        } else {
          console.log('📥 INVENTORY HOOK: No diamonds found');
          return [];
        }
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
    } catch (err) {
      console.error('📥 INVENTORY HOOK: Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      setDiamonds([]);
      setAllDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [user, processImageUrl, detect360Url, inventoryCache]);

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
