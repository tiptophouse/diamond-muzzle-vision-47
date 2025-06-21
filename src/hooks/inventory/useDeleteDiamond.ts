
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

    // Optimistic UI update - remove diamond immediately
    if (removeDiamondFromState) {
      removeDiamondFromState(diamondId);
    }

    try {
      console.log('🔒 Secure Delete: Deleting diamond ID:', diamondId, 'for user:', user.id);
      
      // Call the secure backend /sold endpoint to delete the diamond
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
      
      toast({
        title: "✅ Success",
        description: "Diamond deleted successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('❌ Failed to delete diamond:', error);
      
      // Restore diamond to state if deletion failed
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
