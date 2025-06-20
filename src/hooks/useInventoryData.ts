
import { useState, useEffect, useCallback } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { fetchInventoryData } from '@/services/inventoryDataService';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useToast } from '@/components/ui/use-toast';

export function useInventoryData() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 INVENTORY HOOK: Fetching inventory data from FastAPI...');
      const result = await fetchInventoryData();

      if (result.error) {
        console.error('📥 INVENTORY HOOK: FastAPI fetch failed:', result.error);
        setError(result.error);
        setDiamonds([]);
        setAllDiamonds([]);
        
        // Show specific error messages to user
        toast({
          title: "Connection Error",
          description: result.error,
          variant: "destructive",
        });
        
        return;
      }

      if (result.data && result.data.length > 0) {
        console.log('📥 INVENTORY HOOK: Processing', result.data.length, 'real diamonds from FastAPI');
        
        // Transform data to match Diamond interface
        const transformedDiamonds: Diamond[] = result.data.map(item => ({
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
        }));

        console.log('📥 INVENTORY HOOK: Successfully transformed', transformedDiamonds.length, 'diamonds');
        setDiamonds(transformedDiamonds);
        setAllDiamonds(transformedDiamonds);
        
        // Show success message
        toast({
          title: "✅ Real Data Loaded",
          description: `Successfully loaded ${transformedDiamonds.length} diamonds from your FastAPI database`,
        });
        
      } else {
        console.log('📥 INVENTORY HOOK: No diamonds found in FastAPI response');
        setDiamonds([]);
        setAllDiamonds([]);
        
        toast({
          title: "No Diamonds Found",
          description: "Your FastAPI database is connected but contains no diamonds. Upload some inventory to get started.",
        });
      }
    } catch (err) {
      console.error('📥 INVENTORY HOOK: Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      setDiamonds([]);
      setAllDiamonds([]);
      
      toast({
        title: "Unexpected Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleRefresh = useCallback(() => {
    console.log('🔄 INVENTORY HOOK: Manual refresh triggered - fetching real data from FastAPI');
    fetchData();
  }, [fetchData]);

  // Initial load when user is available
  useEffect(() => {
    if (authLoading) {
      console.log('⏳ INVENTORY HOOK: Waiting for auth...');
      return;
    }
    
    if (user) {
      console.log('👤 INVENTORY HOOK: User available, fetching real data from FastAPI for:', user.id);
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
      console.log('🔄 INVENTORY HOOK: Inventory change detected, refreshing real data...');
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
