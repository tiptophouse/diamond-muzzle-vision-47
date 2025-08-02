import { useState, useEffect, useCallback } from 'react';
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

  // Map API shape formats to display formats
  const normalizeShape = (apiShape: string): string => {
    if (!apiShape) return 'Round';
    
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
    
    const normalized = apiShape.toLowerCase().trim();
    return shapeMap[normalized] || apiShape.charAt(0).toUpperCase() + apiShape.slice(1).toLowerCase();
  };

  // Enhanced image URL processing - separate from 360° URLs
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

    // Skip 360° viewers (these should go to gem360Url field instead)
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

    return trimmedUrl;
  }, []);

  // Enhanced 360° URL detection and processing
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

    // Check for 360° indicators
    const is360Url = trimmedUrl.includes('v360.in') ||
                     trimmedUrl.includes('diamondview.aspx') ||
                     trimmedUrl.includes('my360.sela') ||
                     trimmedUrl.includes('gem360') ||
                     trimmedUrl.includes('sarine') ||
                     trimmedUrl.includes('360') ||
                     trimmedUrl.includes('.html') ||
                     trimmedUrl.match(/DAN\d+-\d+[A-Z]?\.jpg$/i);

    if (!is360Url) {
      return undefined;
    }

    // Ensure proper protocol
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return `https://${trimmedUrl}`;
    }

    return trimmedUrl;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 INVENTORY HOOK: Fetching inventory data...');
      const result = await fetchInventoryData();

      if (result.error) {
        console.error('📥 INVENTORY HOOK: Fetch failed:', result.error);
        setError(result.error);
        setDiamonds([]);
        setAllDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        console.log('📥 INVENTORY HOOK: Processing', result.data.length, 'diamonds');
        
        // Transform data to match Diamond interface with enhanced field mapping
        const transformedDiamonds: Diamond[] = result.data.map(item => {
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
            price: Number(
              item.price_per_carat ? 
                item.price_per_carat * (item.weight || item.carat || item.Weight) : 
                item.price || item.Price || item.RapnetAskingPrice || item.IndexAskingPrice || 0
            ) || 0,
            status: item.status || item.Availability || 'Available',
            fluorescence: item.fluorescence || item.FluorescenceIntensity || undefined,
            imageUrl: finalImageUrl,
            // Enhanced 360° URL detection - ADD "pic" field for your CSV!
            gem360Url: detect360Url(item.gem360_url) || 
                       detect360Url(item.pic) ||           // YOUR CSV "Pic" field!
                       detect360Url(item.picture) ||       // Alternative
                       detect360Url(item['Video link']) || 
                       detect360Url(item.videoLink) ||
                       detect360Url(item.video_url) ||
                       detect360Url(item.v360_url) ||
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
  }, [processImageUrl, detect360Url]);

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
