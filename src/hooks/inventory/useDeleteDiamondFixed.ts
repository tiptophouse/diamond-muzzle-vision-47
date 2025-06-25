
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { getBackendAccessToken } from '@/lib/api/config';

export function useDeleteDiamondFixed() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { trackDiamondOperation } = useEnhancedUserTracking();

  const deleteDiamondMutation = useMutation({
    mutationFn: async (diamondId: string): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🗑️ DIAMOND DELETE: Starting deletion for diamond ID:', diamondId);

      // Get the access token dynamically
      const accessToken = await getBackendAccessToken();
      
      if (!accessToken) {
        throw new Error('No access token available for authentication');
      }

      console.log('🗑️ DIAMOND DELETE: Using access token for deletion');

      // Use the correct FastAPI v1 delete endpoint
      const deleteUrl = `https://api.mazalbot.com/api/v1/delete_stone/${diamondId}`;
      console.log('🗑️ DIAMOND DELETE: Making DELETE request to:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Telegram-User-ID': user.id.toString()
        }
      });

      console.log('🗑️ DIAMOND DELETE: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `Failed to delete diamond (${response.status})`;
        console.error('🗑️ DIAMOND DELETE: Failed with error:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('🗑️ DIAMOND DELETE: Deletion successful:', result);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Diamond deleted successfully from your inventory!",
      });
      
      trackDiamondOperation('delete', { success: true });
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: Error) => {
      console.error('🗑️ DIAMOND DELETE: Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete diamond. Please try again.",
        variant: "destructive",
      });
      
      trackDiamondOperation('delete', { success: false, error: error.message });
    },
  });

  return {
    deleteDiamond: deleteDiamondMutation.mutateAsync,
    isLoading: deleteDiamondMutation.isPending,
  };
}
