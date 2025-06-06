
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
      console.error('Delete failed: User not authenticated');
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    // Validate diamond ID format
    if (!diamondId || !isValidUUID(diamondId)) {
      console.error('Delete failed: Invalid diamond ID format:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID format",
      });
      return false;
    }

    try {
      console.log('🗑️ Starting diamond deletion process:');
      console.log('- Diamond ID:', diamondId);
      console.log('- User ID:', user.id);
      console.log('- User type:', typeof user.id);
      
      // Convert user ID to numeric for FastAPI (Telegram ID)
      const numericUserId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      console.log('- Converted numeric user ID:', numericUserId);
      
      // Primary deletion: Use FastAPI with proper numeric user ID
      console.log('🚀 Attempting FastAPI deletion...');
      const deleteEndpoint = apiEndpoints.deleteDiamond(diamondId, numericUserId);
      console.log('- Delete endpoint:', deleteEndpoint);
      
      const response = await api.delete(deleteEndpoint);
      console.log('- FastAPI delete response:', response);
      
      if (response.error) {
        console.error('❌ FastAPI deletion failed:', response.error);
        throw new Error(`FastAPI deletion failed: ${response.error}`);
      }
      
      console.log('✅ Diamond successfully deleted from FastAPI');
      
      // Also try to clean up from Supabase as backup
      try {
        console.log('🧹 Attempting Supabase cleanup...');
        const { error: supabaseError } = await supabase
          .from('inventory')
          .delete()
          .eq('id', diamondId)
          .eq('user_id', numericUserId);
          
        if (supabaseError) {
          console.warn('⚠️ Supabase cleanup failed (non-critical):', supabaseError);
        } else {
          console.log('✅ Supabase cleanup successful');
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase cleanup error (non-critical):', supabaseError);
      }
      
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      // Trigger refresh immediately
      if (onSuccess) {
        console.log('🔄 Triggering data refresh...');
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Diamond deletion failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond from FastAPI";
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
