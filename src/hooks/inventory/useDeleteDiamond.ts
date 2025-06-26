
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { getAccessToken } from '@/lib/api/config';

export function useDeleteDiamond() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { triggerInventoryChange } = useInventoryDataSync();

  const deleteDiamondMutation = useMutation({
    mutationFn: async (stoneId: string): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No authentication token available');
      }

      console.log('🗑️ DELETE: Attempting to delete stone with ID:', stoneId);

      // Use the correct FastAPI delete endpoint
      const response = await fetch(`https://api.mazalbot.com/api/v1/delete_stone/${stoneId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Telegram-User-ID': user.id.toString()
        }
      });

      console.log('🗑️ DELETE: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('🗑️ DELETE: Failed to delete stone:', errorData);
        throw new Error(`Failed to delete stone: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🗑️ DELETE: Delete successful:', result);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "✅ Success",
        description: "Stone deleted successfully from your inventory!",
      });
      
      // Trigger inventory refresh
      triggerInventoryChange();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
    },
    onError: (error: Error) => {
      console.error('🗑️ DELETE: Error deleting stone:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete stone. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    deleteDiamond: deleteDiamondMutation.mutateAsync,
    isDeleting: deleteDiamondMutation.isPending,
  };
}
