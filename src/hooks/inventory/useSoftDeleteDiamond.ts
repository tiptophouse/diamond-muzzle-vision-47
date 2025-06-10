
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { isValidUUID } from '@/utils/diamondUtils';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseSoftDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useSoftDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseSoftDeleteDiamondProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const softDeleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
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
      console.log('Soft deleting diamond ID:', diamondId, 'for user:', user.id);
      
      // Soft delete by setting deleted_at timestamp
      const { error } = await supabase
        .from('inventory')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', diamondId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Diamond Moved to Archive",
        description: "Diamond has been archived. You can restore it from the Archive page if needed.",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to soft delete diamond:', error);
      
      // Restore diamond to state if deletion failed
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    }
  };

  const restoreDiamond = async (diamondId: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      console.log('Restoring diamond ID:', diamondId, 'for user:', user.id);
      
      // Restore by setting deleted_at to null
      const { error } = await supabase
        .from('inventory')
        .update({ deleted_at: null })
        .eq('id', diamondId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Diamond Restored",
        description: "Diamond has been restored to your inventory.",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to restore diamond:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to restore diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    }
  };

  const permanentDeleteDiamond = async (diamondId: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      console.log('Permanently deleting diamond ID:', diamondId, 'for user:', user.id);
      
      // Permanent deletion from database
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', diamondId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Diamond Permanently Deleted",
        description: "Diamond has been permanently removed from the database.",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to permanently delete diamond:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to permanently delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    }
  };

  return { 
    softDeleteDiamond, 
    restoreDiamond, 
    permanentDeleteDiamond 
  };
}
