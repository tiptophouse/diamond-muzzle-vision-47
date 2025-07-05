
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  onRefreshInventory?: () => void;
  onOptimisticDelete?: (diamondId: string) => void;
  onRestoreDiamond?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ 
  onSuccess, 
  onRefreshInventory, 
  onOptimisticDelete,
  onRestoreDiamond 
}: UseDeleteDiamondProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteDiamond = async (diamond: Diamond) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    // Get the correct diamond ID for the API call
    const diamondApiId = diamond.diamond_id || diamond.id;
    
    console.log('🗑️ DELETE: Starting delete operation for diamond:', {
      id: diamond.id,
      diamond_id: diamond.diamond_id,
      stockNumber: diamond.stockNumber,
      apiId: diamondApiId
    });

    // Optimistically remove from UI immediately
    if (onOptimisticDelete) {
      onOptimisticDelete(diamond.id);
    }

    try {
      // Call DELETE /api/v1/delete_stone/{id}?diamond_id={diamond_id}
      const endpoint = apiEndpoints.deleteDiamond(diamondApiId.toString());
      const deleteUrl = `${endpoint}?diamond_id=${diamondApiId}`;
      
      console.log('🗑️ DELETE: Calling API:', deleteUrl);
      
      const response = await api.delete(deleteUrl);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ DELETE: Diamond deleted successfully from API');
      
      // Show success message
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      // Refresh inventory to ensure sync
      if (onRefreshInventory) {
        console.log('🔄 DELETE: Refreshing inventory after successful deletion');
        setTimeout(() => {
          onRefreshInventory();
        }, 500); // Small delay to ensure API propagation
      }
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ DELETE: Failed to delete diamond:', error);
      
      // Restore diamond to UI on failure
      if (onRestoreDiamond) {
        onRestoreDiamond(diamond);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
