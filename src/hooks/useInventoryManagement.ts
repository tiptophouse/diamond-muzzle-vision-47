
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';

export function useInventoryManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteAllInventory = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete inventory",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const userId = getCurrentUserId() || user.id;
      console.log('🗑️ BULK DELETE: Starting delete all inventory for user:', userId);
      
      const endpoint = apiEndpoints.deleteAllInventory(userId);
      console.log('🗑️ BULK DELETE: Using endpoint:', endpoint);
      
      const result = await api.delete(endpoint);
      
      if (result.error) {
        console.error('❌ BULK DELETE: FastAPI delete all failed:', result.error);
        toast({
          title: "Delete Failed ❌",
          description: `Failed to delete all inventory: ${result.error}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ BULK DELETE: All inventory deleted successfully from FastAPI');
      toast({
        title: "Success ✅",
        description: "All inventory deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('❌ BULK DELETE: Failed to delete all inventory:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete all inventory";
      toast({
        title: "Delete Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAllInventory = async (csvData: any[]) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update inventory",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const userId = getCurrentUserId() || user.id;
      console.log('📤 BULK UPDATE: Starting bulk update for user:', userId, 'with', csvData.length, 'items');
      
      const endpoint = apiEndpoints.updateAllInventory(userId);
      console.log('📤 BULK UPDATE: Using endpoint:', endpoint);
      
      // Transform CSV data to match FastAPI expected format
      const transformedData = csvData.map(item => ({
        user_id: userId,
        stock_number: item.stock_number || item.stockNumber || '',
        shape: item.shape || 'Round',
        weight: Number(item.weight || item.carat) || 0,
        color: item.color || 'D',
        clarity: item.clarity || 'FL',
        cut: item.cut || 'Excellent',
        price: Number(item.price) || 0,
        price_per_carat: item.price_per_carat || Math.round((Number(item.price) || 0) / (Number(item.weight || item.carat) || 1)),
        status: item.status || 'Available',
        picture: item.picture || '',
        certificate_number: item.certificate_number || '',
        certificate_url: item.certificate_url || '',
        lab: item.lab || 'GIA',
        store_visible: item.store_visible !== false,
      }));
      
      const result = await api.post(endpoint, { stones: transformedData });
      
      if (result.error) {
        console.error('❌ BULK UPDATE: FastAPI bulk update failed:', result.error);
        toast({
          title: "Update Failed ❌",
          description: `Failed to update inventory: ${result.error}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ BULK UPDATE: Inventory updated successfully in FastAPI');
      toast({
        title: "Success ✅",
        description: `Successfully updated ${csvData.length} items in your inventory`,
      });
      
      return true;
    } catch (error) {
      console.error('❌ BULK UPDATE: Failed to update inventory:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update inventory";
      toast({
        title: "Update Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    deleteAllInventory,
    updateAllInventory,
  };
}
