
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from '@/lib/api';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';

export function useAddDiamond() {
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: DiamondFormData): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('📤 Adding diamond via FastAPI...', data);
      const response = await api.post(apiEndpoints.addDiamond(user.id), data);

      if (response.error) {
        throw new Error(response.error);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Diamond added successfully",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error adding diamond:', error);
      toast({
        title: "Error",
        description: "Failed to add diamond. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    addDiamond: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
