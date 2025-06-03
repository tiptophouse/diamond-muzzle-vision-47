
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
      console.log('Starting diamond deletion process for ID:', diamondId, 'User:', user.id);
      
      // Primary deletion method: Use FastAPI which is the main data source
      console.log('Attempting FastAPI deletion...');
      const response = await api.delete(apiEndpoints.deleteDiamond(diamondId, user.id));
      
      if (response.error) {
        console.error('FastAPI deletion failed:', response.error);
        
        // Fallback: Try Supabase deletion with proper user ID handling
        console.log('Attempting Supabase fallback deletion...');
        
        // For Supabase, we need to handle the user_id field which might be numeric (telegram_id)
        // First try with the UUID user id
        let supabaseError = null;
        const { error: uuidError } = await supabase
          .from('inventory')
          .delete()
          .eq('id', diamondId)
          .eq('user_id', user.id);

        if (uuidError) {
          console.log('UUID deletion failed, trying with telegram_id:', uuidError);
          // If UUID fails, try with numeric telegram_id
          const { error: telegramIdError } = await supabase
            .from('inventory')
            .delete()
            .eq('id', diamondId)
            .eq('user_id', parseInt(user.id.toString()));

          supabaseError = telegramIdError;
        }

        if (supabaseError) {
          console.error('Both FastAPI and Supabase deletion failed:', supabaseError);
          throw new Error('Failed to delete diamond from both systems');
        }
      }
      
      console.log('Diamond deletion successful');
      
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      // Trigger immediate refresh
      if (onSuccess) {
        console.log('Calling onSuccess callback to refresh data');
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete diamond:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
