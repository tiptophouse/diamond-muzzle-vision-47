
import { useState, useEffect, useCallback } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { fetchInventoryData } from '@/services/inventoryDataService';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useInventoryState } from '@/hooks/inventory/useInventoryState';

export function useInventoryData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const [error, setError] = useState<string | null>(null);
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  
  const {
    loading,
    setLoading,
    diamonds,
    allDiamonds,
    updateDiamonds,
    clearDiamonds,
    removeDiamondFromState,
    restoreDiamondToState
  } = useInventoryState();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 INVENTORY HOOK: Fetching inventory data...');
      const result = await fetchInventoryData();

      if (result.error) {
        console.error('📥 INVENTORY HOOK: Fetch failed:', result.error);
        setError(result.error);
        clearDiamonds();
        return;
      }

      if (result.data && result.data.length > 0) {
        console.log('📥 INVENTORY HOOK: Processing', result.data.length, 'diamonds');
        
        // Transform data to match Diamond interface
        const transformedDiamonds: Diamond[] = result.data.map(item => ({
          id: item.id?.toString() || `${item.stock_number || item.stockNumber}-${Date.now()}`,
          diamond_id: item.id || item.diamond_id, // Store API diamond ID
          stockNumber: item.stock_number || item.stockNumber || '',
          shape: item.shape || 'Round',
          carat: Number(item.weight || item.carat) || 0,
          color: item.color || 'D',
          clarity: item.clarity || 'FL',
          cut: item.cut || 'Excellent',
          price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
          status: item.status || 'Available',
          imageUrl: item.picture || item.imageUrl || undefined,
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number?.toString() || item.certificateNumber || undefined,
          lab: item.lab || undefined,
          certificateUrl: item.certificate_url || item.certificateUrl || undefined,
        }));

        console.log('📥 INVENTORY HOOK: Transformed diamonds:', transformedDiamonds.length);
        updateDiamonds(transformedDiamonds);
      } else {
        console.log('📥 INVENTORY HOOK: No diamonds found');
        clearDiamonds();
      }
    } catch (err) {
      console.error('📥 INVENTORY HOOK: Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      clearDiamonds();
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearDiamonds, updateDiamonds]);

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
      clearDiamonds();
      setError("Please log in to view your inventory.");
    }
  }, [user, authLoading, fetchData, setLoading, clearDiamonds]);

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
