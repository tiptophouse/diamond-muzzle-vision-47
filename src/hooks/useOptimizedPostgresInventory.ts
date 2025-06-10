
import { useState, useEffect, useCallback } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { optimizedInventoryService } from '@/services/optimizedInventoryService';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from '@/components/ui/use-toast';

interface InventoryFilters {
  shape?: string;
  status?: string;
  store_visible?: boolean;
  search?: string;
  limit?: number;
}

export function useOptimizedPostgresInventory() {
  const { user } = useTelegramAuth();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async (filters: InventoryFilters = {}) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      console.time('🚀 PostgreSQL Fetch');
      const data = await optimizedInventoryService.getInventory(user.id, filters);
      console.timeEnd('🚀 PostgreSQL Fetch');
      
      setDiamonds(data);
      
    } catch (error) {
      console.error('❌ Fetch failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load inventory');
      
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Failed to load inventory from PostgreSQL",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createDiamond = useCallback(async (diamondData: any) => {
    if (!user?.id) return false;

    try {
      const success = await optimizedInventoryService.createDiamond(user.id, diamondData);
      
      if (success) {
        toast({
          title: "Diamond Created! ⚡",
          description: "Ultra-fast PostgreSQL creation successful",
        });
        await fetchInventory();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Create failed:', error);
      return false;
    }
  }, [user?.id, fetchInventory]);

  const updateDiamond = useCallback(async (diamondId: string, updates: any) => {
    if (!user?.id) return false;

    try {
      const success = await optimizedInventoryService.updateDiamond(user.id, diamondId, updates);
      
      if (success) {
        toast({
          title: "Diamond Updated! ⚡",
          description: "Lightning-fast PostgreSQL update completed",
        });
        await fetchInventory();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Update failed:', error);
      return false;
    }
  }, [user?.id, fetchInventory]);

  const deleteDiamond = useCallback(async (diamondId: string, hardDelete = false) => {
    if (!user?.id) return false;

    try {
      const success = await optimizedInventoryService.deleteDiamond(user.id, diamondId, hardDelete);
      
      if (success) {
        toast({
          title: hardDelete ? "Diamond Deleted! ⚡" : "Diamond Archived! ⚡",
          description: "Super-fast PostgreSQL deletion completed",
        });
        await fetchInventory();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Delete failed:', error);
      return false;
    }
  }, [user?.id, fetchInventory]);

  const bulkDelete = useCallback(async (diamondIds: string[]) => {
    if (!user?.id) return false;

    try {
      const success = await optimizedInventoryService.bulkOperations(user.id, 'bulk_delete', diamondIds);
      
      if (success) {
        toast({
          title: `Bulk Deleted ${diamondIds.length} Items! ⚡`,
          description: "Ultra-fast PostgreSQL bulk operation completed",
        });
        await fetchInventory();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      return false;
    }
  }, [user?.id, fetchInventory]);

  // Smart search with debouncing
  const searchInventory = useCallback(async (searchTerm: string) => {
    if (!user?.id) return;

    await fetchInventory({ 
      search: searchTerm,
      limit: searchTerm ? 100 : undefined 
    });
  }, [user?.id, fetchInventory]);

  // Filter inventory
  const filterInventory = useCallback(async (filters: InventoryFilters) => {
    await fetchInventory(filters);
  }, [fetchInventory]);

  // Initial load
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    diamonds,
    loading,
    error,
    fetchInventory,
    createDiamond,
    updateDiamond,
    deleteDiamond,
    bulkDelete,
    searchInventory,
    filterInventory,
    refreshInventory: () => fetchInventory(),
  };
}
