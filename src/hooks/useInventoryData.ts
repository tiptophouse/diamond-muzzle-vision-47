
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
      'princess': 'Princess',
      'cushion': 'Cushion',
      'emerald': 'Emerald',
      'oval': 'Oval',
      'pear': 'Pear',
      'marquise': 'Marquise',
      'radiant': 'Radiant',
      'asscher': 'Asscher',
      'heart': 'Heart'
    };
    
    const normalized = apiShape.toLowerCase().trim();
    return shapeMap[normalized] || apiShape.charAt(0).toUpperCase() + apiShape.slice(1).toLowerCase();
  };

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
        
        // Transform data to match Diamond interface with enhanced media fields
        const transformedDiamonds: Diamond[] = result.data.map(item => ({
          id: item.id || `${item.stock || item.stock_number}-${Date.now()}`,
          diamondId: item.id || item.diamond_id,
          stockNumber: item.stock || item.stock_number || item.stockNumber || '',
          shape: normalizeShape(item.shape),
          carat: parseFloat((item.weight || item.carat || 0).toString()) || 0,
          color: (item.color || 'D').toUpperCase(),
          clarity: (item.clarity || 'FL').toUpperCase(),
          cut: item.cut || 'Excellent',
          price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
          status: item.status || 'Available',
          fluorescence: item.fluorescence || undefined,
          imageUrl: item.picture || item.imageUrl || undefined,
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number || item.certificateNumber || undefined,
          lab: item.lab || undefined,
          certificateUrl: item.certificate_url || item.certificateUrl || undefined,
          
          // Enhanced media fields
          v360Url: item.v360_url || undefined,
          gem360Url: item.gem360_url || undefined,
          videoUrl: item.video_url || undefined,
          certificateImageUrl: item.certificate_image_url || undefined,
          giaReportPdf: item.gia_report_pdf || undefined,
          
          // Additional compatibility fields
          polish: item.polish || undefined,
          symmetry: item.symmetry || undefined,
          tablePercentage: item.table_percentage || undefined,
          depthPercentage: item.depth_percentage || undefined,
          length: item.length || undefined,
          width: item.width || undefined,
          depth: item.depth || undefined,
          ratio: item.ratio || undefined,
          gridle: item.gridle || undefined,
          culet: item.culet || undefined,
          rapnet: item.rapnet || undefined,
          pricePerCarat: item.price_per_carat || undefined,
          certificateComment: item.certificate_comment || undefined,
        }));

        console.log('📥 INVENTORY HOOK: Transformed diamonds:', transformedDiamonds.length);
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
  }, []);

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
