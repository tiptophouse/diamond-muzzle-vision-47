
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { isValidUUID } from '@/utils/diamondUtils';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    if (!diamondId || !isValidUUID(diamondId)) {
      console.error('Invalid diamond ID for deletion:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID format",
      });
      return false;
    }

    // Don't remove from state optimistically - wait for API confirmation
    console.log('Starting deletion for diamond ID:', diamondId, 'for user:', user.id);

    try {
      console.log('Making DELETE request to:', `/delete_diamond?diamond_id=${diamondId}&user_id=${user.id}`);
      
      // Use the new secure DELETE endpoint with query parameters
      const response = await api.delete(`/delete_diamond?diamond_id=${diamondId}&user_id=${user.id}`);
      
      console.log('Delete API response:', response);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Only remove from state after successful API response
      if (removeDiamondFromState) {
        console.log('Removing diamond from state after successful deletion');
        removeDiamondFromState(diamondId);
      }
      
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      if (onSuccess) {
        console.log('Calling onSuccess callback');
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete diamond:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error", 
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
