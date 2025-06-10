
import { useState, useEffect, useCallback } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { unifiedInventoryService } from '@/services/unifiedInventoryService';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from '@/components/ui/use-toast';

interface InventoryState {
  diamonds: Diamond[];
  loading: boolean;
  error: string | null;
  debugInfo: any;
}

export function useOptimizedInventory() {
  const { user } = useTelegramAuth();
  const [state, setState] = useState<InventoryState>({
    diamonds: [],
    loading: true,
    error: null,
    debugInfo: null
  });

  const updateState = useCallback((updates: Partial<InventoryState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchInventory = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      updateState({ loading: false, error: 'User not authenticated' });
      return;
    }

    try {
      updateState({ loading: true, error: null });
      
      const result = await unifiedInventoryService.getInventory(user.id, forceRefresh);
      
      updateState({
        diamonds: result.data,
        loading: false,
        debugInfo: result.debugInfo
      });

      console.log('✅ Inventory loaded:', result.data.length, 'diamonds');
      
    } catch (error) {
      console.error('❌ Inventory fetch failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load inventory';
      
      updateState({
        loading: false,
        error: errorMessage,
        diamonds: []
      });

      toast({
        variant: "destructive",
        title: "Inventory Load Failed",
        description: errorMessage,
      });
    }
  }, [user?.id, updateState]);

  const deleteDiamond = useCallback(async (diamondId: string, isHardDelete = false) => {
    if (!user?.id) return false;

    // Optimistic update
    const originalDiamonds = state.diamonds;
    updateState({
      diamonds: state.diamonds.filter(d => d.id !== diamondId)
    });

    try {
      const success = await unifiedInventoryService.deleteDiamond(diamondId, user.id, isHardDelete);
      
      if (success) {
        toast({
          title: isHardDelete ? "Diamond Deleted" : "Diamond Archived",
          description: isHardDelete 
            ? "Diamond permanently removed from inventory" 
            : "Diamond moved to archive",
        });
        return true;
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('❌ Delete failed:', error);
      
      // Revert optimistic update
      updateState({ diamonds: originalDiamonds });
      
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete diamond",
      });
      return false;
    }
  }, [user?.id, state.diamonds, updateState]);

  const updateDiamond = useCallback(async (diamondId: string, updates: Partial<Diamond>) => {
    if (!user?.id) return false;

    // Optimistic update
    const originalDiamonds = state.diamonds;
    updateState({
      diamonds: state.diamonds.map(d => 
        d.id === diamondId ? { ...d, ...updates } : d
      )
    });

    try {
      const success = await unifiedInventoryService.updateDiamond(diamondId, updates, user.id);
      
      if (success) {
        toast({
          title: "Diamond Updated",
          description: "Diamond information successfully updated",
        });
        return true;
      } else {
        throw new Error('Update operation failed');
      }
    } catch (error) {
      console.error('❌ Update failed:', error);
      
      // Revert optimistic update
      updateState({ diamonds: originalDiamonds });
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update diamond",
      });
      return false;
    }
  }, [user?.id, state.diamonds, updateState]);

  const refreshInventory = useCallback(() => {
    fetchInventory(true);
  }, [fetchInventory]);

  // Initial load
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    ...state,
    refreshInventory,
    deleteDiamond,
    updateDiamond,
    fetchInventory
  };
}
