
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseFastAPIDeletionProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useFastAPIDeletion({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseFastAPIDeletionProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteDiamondViaAPI = async (diamondId: string, diamondData?: Diamond) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    // Optimistic UI update - remove diamond immediately
    if (removeDiamondFromState) {
      removeDiamondFromState(diamondId);
    }

    try {
      console.log('🗑️ FastAPI: Deleting diamond via API:', diamondId, 'for user:', user.id);
      
      // Call FastAPI backend to delete the diamond
      const response = await api.post('/sold', {
        diamond_id: diamondId,
        user_id: user.id,
        action: 'delete'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('✅ FastAPI: Diamond deleted successfully via API');
      
      toast({
        title: "Diamond Deleted",
        description: "Diamond has been successfully removed from your inventory.",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('❌ FastAPI: Failed to delete diamond via API:', error);
      
      // Restore diamond to state if deletion failed
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond via API. Please try again.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  const softDeleteDiamondViaAPI = async (diamondId: string, diamondData?: Diamond) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    // Optimistic UI update - remove diamond immediately
    if (removeDiamondFromState) {
      removeDiamondFromState(diamondId);
    }

    try {
      console.log('🗃️ FastAPI: Soft deleting diamond via API:', diamondId, 'for user:', user.id);
      
      // Call FastAPI backend to soft delete the diamond
      const response = await api.post('/archive', {
        diamond_id: diamondId,
        user_id: user.id,
        action: 'soft_delete'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('✅ FastAPI: Diamond soft deleted successfully via API');
      
      toast({
        title: "Diamond Archived",
        description: "Diamond has been moved to archive. You can restore it from the Archive page if needed.",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('❌ FastAPI: Failed to soft delete diamond via API:', error);
      
      // Restore diamond to state if deletion failed
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to archive diamond via API. Please try again.";
      toast({
        variant: "destructive",
        title: "Archive Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  return { 
    deleteDiamondViaAPI, 
    softDeleteDiamondViaAPI 
  };
}
