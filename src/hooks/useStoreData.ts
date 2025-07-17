
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryDataSync } from "./inventory/useInventoryDataSync";
import { useTelegramStorage } from "./useTelegramStorage";

export function useStoreData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const { saveDiamonds, getDiamonds, storageType, isCloudStorageReady } = useTelegramStorage();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [user, authLoading]);

  // Subscribe to inventory changes
  useEffect(() => {
    return subscribeToInventoryChanges(() => {
      if (user && !authLoading) {
        fetchStoreData();
      }
    });
  }, [user, authLoading, subscribeToInventoryChanges]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏪 STORE: Fetching data from FastAPI backend for authenticated user');
      const result = await fetchInventoryData();

      if (result.error) {
        console.error('🏪 STORE: Data fetch failed:', result.error);
        setError(result.error);
        setDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        console.log('🏪 STORE: Raw data received:', result.data.length, 'items');
        console.log('🏪 STORE: Sample raw item:', result.data[0]);

        // Transform data to match Diamond interface and filter for store-visible diamonds
        const transformedDiamonds: Diamond[] = result.data
          .map((item, index) => {
            // Better image URL detection - check multiple possible fields
            let imageUrl = item.picture || item.imageUrl || item.image_url || item.certificate_url || undefined;
            
            // If certificate_url contains v360.in or other image domains, use it as imageUrl
            if (!imageUrl && item.certificate_url) {
              const certUrl = item.certificate_url.toLowerCase();
              if (certUrl.includes('v360.in') || certUrl.includes('diamondview') || 
                  certUrl.includes('.jpg') || certUrl.includes('.png') || certUrl.includes('.gif')) {
                imageUrl = item.certificate_url;
              }
            }

            // Check certificateUrl as well
            if (!imageUrl && item.certificateUrl) {
              const certUrl = item.certificateUrl.toLowerCase();
              if (certUrl.includes('v360.in') || certUrl.includes('diamondview') || 
                  certUrl.includes('.jpg') || certUrl.includes('.png') || certUrl.includes('.gif')) {
                imageUrl = item.certificateUrl;
              }
            }

            // Better Gem360 URL detection and handling
            let gem360Url = item.gem360_url || item.gem360Url;
            
            // Check if certificate_url contains gem360 or v360
            if (!gem360Url && item.certificate_url && 
                (item.certificate_url.includes('gem360') || item.certificate_url.includes('v360.in'))) {
              gem360Url = item.certificate_url;
            }
            
            // Check if certificateUrl contains gem360 or v360
            if (!gem360Url && item.certificateUrl && 
                (item.certificateUrl.includes('gem360') || item.certificateUrl.includes('v360.in'))) {
              gem360Url = item.certificateUrl;
            }

            console.log(`🔍 STORE: Processing diamond ${index + 1}/${result.data.length}:`, {
              stockNumber: item.stock_number || item.stockNumber,
              shape: item.shape,
              carat: item.weight || item.carat,
              hasImageUrl: !!imageUrl,
              imageUrl: imageUrl,
              hasGem360: !!gem360Url,
              gem360Url: gem360Url,
              certificateUrl: item.certificate_url,
              picture: item.picture,
              rawItem: item
            });

            const transformedDiamond = {
              id: item.id || `${item.stock_number || item.stockNumber}-${Date.now()}-${index}`,
              stockNumber: String(item.stock_number || item.stockNumber || 'UNKNOWN'),
              shape: item.shape,
              carat: Number(item.weight || item.carat) || 0,
              color: item.color,
              clarity: item.clarity,
              cut: item.cut || 'Excellent',
              price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
              status: item.status || 'Available',
              imageUrl: imageUrl,
              store_visible: item.store_visible !== false, // Default to true for store display
              certificateNumber: item.certificate_number || undefined,
              lab: item.lab || undefined,
              gem360Url: gem360Url || undefined,
              certificateUrl: item.certificate_url || item.certificateUrl || undefined
            };

            console.log('✅ STORE: Transformed diamond:', transformedDiamond);
            return transformedDiamond;
          })
          .filter(diamond => {
            const isVisible = diamond.store_visible && diamond.status === 'Available';
            console.log(`🔍 STORE: Diamond ${diamond.stockNumber} - visible: ${isVisible} (store_visible: ${diamond.store_visible}, status: ${diamond.status})`);
            return isVisible;
          })
          .sort((a, b) => {
            // Prioritize diamonds with images first
            const aHasImage = !!a.imageUrl;
            const bHasImage = !!b.imageUrl;
            
            if (aHasImage && !bHasImage) return -1;
            if (!aHasImage && bHasImage) return 1;
            
            // If both have images or both don't have images, sort by carat (descending)
            return b.carat - a.carat;
          });

        console.log('🏪 STORE: Final processed results:');
        console.log(`📊 Total diamonds processed: ${result.data.length}`);
        console.log(`📊 Store-visible diamonds: ${transformedDiamonds.length}`);
        console.log(`📸 Diamonds with image URLs: ${transformedDiamonds.filter(d => d.imageUrl).length}`);
        console.log(`💎 Diamonds with Gem360 URLs: ${transformedDiamonds.filter(d => d.gem360Url).length}`);
        
        // Log the first few diamonds with images
        const diamondsWithImages = transformedDiamonds.filter(d => d.imageUrl);
        if (diamondsWithImages.length > 0) {
          console.log('📸 STORE: Diamonds with images (first 3):');
          diamondsWithImages.slice(0, 3).forEach((diamond, index) => {
            console.log(`  ${index + 1}. Stock: ${diamond.stockNumber}, Image: ${diamond.imageUrl}`);
          });
        } else {
          console.warn('⚠️ STORE: No diamonds found with image URLs!');
        }
        
        // Save to Telegram storage for offline access
        await saveDiamonds(transformedDiamonds);
        console.log(`📱 Saved diamonds to ${storageType} storage`);
        
        setDiamonds(transformedDiamonds);
      } else {
        console.log('🏪 STORE: No diamonds found in response');
        // Try to load from local storage if no network data
        const storedDiamonds = getDiamonds();
        if (storedDiamonds.length > 0) {
          console.log('📱 Loading', storedDiamonds.length, 'diamonds from', storageType, 'storage');
          setDiamonds(storedDiamonds);
        } else {
          setDiamonds([]);
        }
      }
    } catch (err) {
      console.error('🏪 STORE: Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load store diamonds';
      
      // Try to load from local storage on error
      const storedDiamonds = getDiamonds();
      if (storedDiamonds.length > 0) {
        console.log('📱 Fallback: Loading', storedDiamonds.length, 'diamonds from', storageType, 'storage');
        setDiamonds(storedDiamonds);
        setError(`${errorMessage} (showing cached data)`);
      } else {
        setError(errorMessage);
        setDiamonds([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    diamonds,
    loading: loading || authLoading,
    error,
    refetch: fetchStoreData,
  };
}
