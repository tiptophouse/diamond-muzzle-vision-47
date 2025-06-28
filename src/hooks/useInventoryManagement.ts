
import { useState } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useInventoryManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteAllInventory = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting all inventory...');
      const response = await api.delete(apiEndpoints.deleteAllInventory(user.id));
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Inventory Deleted",
        description: "Successfully deleted all inventory items",
      });
      return true;
    } catch (error) {
      console.error('❌ Error deleting inventory:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete inventory",
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
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Updating all inventory...');
      const response = await api.post(apiEndpoints.updateAllInventory(user.id), {
        diamonds: csvData
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Inventory Updated",
        description: `Successfully updated inventory with ${csvData.length} items`,
      });
      return true;
    } catch (error) {
      console.error('❌ Error updating inventory:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update inventory",
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
