
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useDeletedDiamondsBlacklist } from '@/hooks/useDeletedDiamondsBlacklist';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  onRefreshInventory?: () => void;
}

export function useDeleteDiamond({ onSuccess, onRefreshInventory }: UseDeleteDiamondProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { addToBlacklist } = useDeletedDiamondsBlacklist();

  const deleteDiamond = async (diamondId: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      console.log('🗑️ DELETE: Starting delete operation for diamond:', diamondId);
      
      // Immediately add to blacklist to prevent showing in UI
      addToBlacklist(diamondId);
      
      // Call DELETE /api/v1/delete_stone/{id}?diamond_id={diamond_id}
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
      const response = await api.delete(`${endpoint}?diamond_id=${diamondId}`);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ DELETE: Diamond deleted successfully and blacklisted');
      
      // Show success message
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      // Refresh inventory by calling GET /api/v1/get_all_stones
      if (onRefreshInventory) {
        console.log('🔄 DELETE: Refreshing inventory after successful deletion');
        onRefreshInventory();
      }
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ DELETE: Failed to delete diamond:', error);
      
      // Remove from blacklist on error so it shows up again
      // removeFromBlacklist(diamondId);
      
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
