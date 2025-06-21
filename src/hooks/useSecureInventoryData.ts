
import { useState, useEffect, useCallback } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { fetchSecureInventoryData } from '@/services/secureInventoryService';
import { useSecureUserData } from '@/hooks/useSecureUserData';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';

export function useSecureInventoryData() {
  const { isUserValid, userId, isLoading: userLoading, validateUserAccess } = useSecureUserData();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribeToInventoryChanges } = useInventoryDataSync();

  const fetchData = useCallback(async () => {
    if (!isUserValid || !userId) {
      console.log('⏳ SECURE INVENTORY: Waiting for user validation...');
      return;
    }

    if (!validateUserAccess()) {
      setError("Access denied: Please log in to view your inventory.");
      setDiamonds([]);
      setAllDiamonds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📥 SECURE INVENTORY: Fetching data for authenticated user:', userId);
      const result = await fetchSecureInventoryData();

      if (result.error) {
        console.error('📥 SECURE INVENTORY: Fetch failed:', result.error);
        setError(result.error);
        setDiamonds([]);
        setAllDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        console.log('📥 SECURE INVENTORY: Processing', result.data.length, 'user-owned diamonds');
        
        // Transform data to match Diamond interface with additional security checks
        const transformedDiamonds: Diamond[] = result.data.map(item => {
          // Verify ownership again at transform time
          const itemUserId = item.user_id || item.owner_id;
          if (itemUserId !== userId) {
            console.warn('🚫 SECURITY: Skipping item not owned by user:', item.id);
            return null;
          }

          return {
            id: item.id || `${item.stock_number}-${Date.now()}`,
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
            certificateNumber: item.certificate_number || item.certificateNumber || undefined,
            lab: item.lab || undefined,
            certificateUrl: item.certificate_url || item.certificateUrl || undefined,
          };
        }).filter(Boolean) as Diamond[];

        console.log('📥 SECURE INVENTORY: Transformed', transformedDiamonds.length, 'secure diamonds');
        setDiamonds(transformedDiamonds);
        setAllDiamonds(transformedDiamonds);
      } else {
        console.log('📥 SECURE INVENTORY: No diamonds found for user:', userId);
        setDiamonds([]);
        setAllDiamonds([]);
      }
    } catch (err) {
      console.error('📥 SECURE INVENTORY: Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory securely';
      setError(errorMessage);
      setDiamonds([]);
      setAllDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [isUserValid, userId, validateUserAccess]);

  const handleRefresh = useCallback(() => {
    console.log('🔄 SECURE INVENTORY: Manual refresh triggered for user:', userId);
    fetchData();
  }, [fetchData, userId]);

  // Initial load when user is validated
  useEffect(() => {
    if (userLoading) {
      console.log('⏳ SECURE INVENTORY: Waiting for user validation...');
      return;
    }
    
    if (isUserValid && userId) {
      console.log('👤 SECURE INVENTORY: User validated, fetching data for:', userId);
      fetchData();
    } else {
      console.log('🚫 SECURE INVENTORY: User not valid, clearing data');
      setLoading(false);
      setDiamonds([]);
      setAllDiamonds([]);
      setError("Please log in to view your inventory.");
    }
  }, [isUserValid, userId, userLoading, fetchData]);

  // Listen for inventory changes
  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      console.log('🔄 SECURE INVENTORY: Inventory change detected, refreshing for user:', userId);
      fetchData();
    });

    return unsubscribe;
  }, [subscribeToInventoryChanges, fetchData, userId]);

  return {
    diamonds,
    allDiamonds,
    loading: loading || userLoading,
    error,
    handleRefresh,
    fetchData,
    userId
  };
}
