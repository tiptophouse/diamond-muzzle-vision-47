
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { isValidUUID } from '@/utils/diamondUtils';

export function useDeleteDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteDiamond = async (diamondId: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    // Validate diamond ID format
    if (!diamondId || !isValidUUID(diamondId)) {
      console.error('Invalid diamond ID for deletion:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID format",
      });
      return false;
    }

    try {
      console.log('Deleting diamond ID:', diamondId, 'for user:', user.id);
      
      // First try deleting directly from Supabase for immediate feedback
      const { error: supabaseError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', diamondId)
        .eq('user_id', user.id);

      if (supabaseError) {
        console.error('Supabase delete error:', supabaseError);
        // Fall back to API deletion
        const response = await api.delete(apiEndpoints.deleteDiamond(diamondId, user.id));
        
        if (response.error) {
          throw new Error(response.error);
        }
      }
      
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      if (onSuccess) onSuccess();
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
