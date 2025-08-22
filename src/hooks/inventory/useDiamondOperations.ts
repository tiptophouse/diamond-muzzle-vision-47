
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';

export function useDiamondOperations() {
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async ({ diamondId, data }: { diamondId: string; data: any }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await api.put(apiEndpoints.updateDiamond(diamondId, user.id), data);
      
      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update diamond",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (diamondId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await api.delete(apiEndpoints.deleteDiamond(diamondId, user.id));
      
      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete diamond",
        variant: "destructive",
      });
    }
  });

  return {
    updateDiamond: (diamondId: string, data: any) => updateMutation.mutateAsync({ diamondId, data }),
    deleteDiamond: (diamondId: string) => deleteMutation.mutateAsync(diamondId),
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
