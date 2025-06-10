
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { isValidUUID } from '@/utils/diamondUtils';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useFastApiDelete } from './useFastApiDelete';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { deleteDiamondFastApi } = useFastApiDelete({ onSuccess, removeDiamondFromState, restoreDiamondToState });

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

    // Try FastAPI deletion first if diamond data is available
    if (diamondData) {
      console.log('🔄 Attempting FastAPI deletion first...');
      try {
        const fastApiSuccess = await deleteDiamondFastApi(diamondData);
        if (fastApiSuccess) {
          console.log('✅ FastAPI deletion successful, proceeding with backend cleanup...');
          // Continue with existing backend cleanup but don't show additional success toast
        } else {
          console.log('❌ FastAPI deletion failed, falling back to original method...');
        }
      } catch (error) {
        console.log('❌ FastAPI deletion error, falling back to original method:', error);
      }
    }

    // Optimistic UI update - remove diamond immediately (if not already done by FastAPI)
    if (removeDiamondFromState && diamondData) {
      removeDiamondFromState(diamondId);
    }

    try {
      console.log('🗑️ Performing backend deletion for diamond ID:', diamondId, 'for user:', user.id);
      
      // Call the backend /sold endpoint to delete the diamond
      const response = await api.post('/sold', {
        diamond_id: diamondId,
        user_id: user.id,
        action: 'delete'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Also delete from Supabase as backup
      const { error: supabaseError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', diamondId)
        .eq('user_id', user.id);

      if (supabaseError) {
        console.warn('Supabase delete warning:', supabaseError);
      }
      
      // Only show success toast if FastAPI didn't already show one
      if (!diamondData) {
        toast({
          title: "Success",
          description: "Diamond deleted successfully",
        });
      }
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('❌ Failed to delete diamond from backend:', error);
      
      // Restore diamond to state if deletion failed and it was removed
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Backend Deletion Error",
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
