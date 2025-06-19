
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
        console.log('📥 INVENTORY HOOK: Debug info:', result.debugInfo);
        
        // Transform data to match Diamond interface with better field mapping
        const transformedDiamonds: Diamond[] = result.data.map(item => {
          // Better ID handling - use the actual backend ID if available
          const diamondId = item.id || `${item.stock_number || item.stock || item.stockNumber}-${Date.now()}`;
          
          console.log('📥 INVENTORY HOOK: Processing diamond:', {
            id: diamondId,
            stock_number: item.stock_number,
            stock: item.stock,
            stockNumber: item.stockNumber
          });

          return {
            id: diamondId,
            stockNumber: item.stock_number || item.stock || item.stockNumber || '',
            shape: item.shape || 'Round',
            carat: Number(item.weight || item.carat) || 0,
            color: item.color || 'D',
            clarity: item.clarity || 'FL',
            cut: item.cut || 'Excellent',
            price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
            status: item.status || 'Available',
            imageUrl: item.picture || item.imageUrl || undefined,
            store_visible: item.store_visible !== false,
            certificateNumber: item.certificate_number || item.certificateNumber || undefined,
            lab: item.lab || undefined,
            certificateUrl: item.certificate_url || item.certificateUrl || undefined,
          };
        });

        console.log('📥 INVENTORY HOOK: Transformed diamonds:', transformedDiamonds.length);
        console.log('📥 INVENTORY HOOK: Sample transformed diamond:', transformedDiamonds[0]);
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

  // State management functions for immediate UI updates
  const removeDiamondFromState = useCallback((diamondId: string) => {
    console.log('🗑️ INVENTORY HOOK: Optimistically removing diamond from state:', diamondId);
    setDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
    setAllDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
  }, []);

  const restoreDiamondToState = useCallback((diamond: Diamond) => {
    console.log('🔄 INVENTORY HOOK: Restoring diamond to state:', diamond.id);
    setDiamonds(prev => [...prev, diamond]);
    setAllDiamonds(prev => [...prev, diamond]);
  }, []);

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
    removeDiamondFromState,
    restoreDiamondToState,
  };
}
