import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

export function useAddDiamond() {
  const queryClient = useQueryClient();
  const { notificationOccurred } = useTelegramHapticFeedback();

  return useMutation({
    mutationFn: async (diamondData: any) => {
      console.log('💎 Adding diamond:', diamondData);
      
      const response = await api.post('/diamonds', diamondData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to add diamond');
      }
      
      return response.data;
    },
    
    onSuccess: () => {
      // Invalidate and refetch inventory data
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['userInventory'] });
      queryClient.invalidateQueries({ queryKey: ['store'] });
      
      // Haptic feedback for success
      notificationOccurred('success');
      
      toast.success('✅ יהלום נוסף בהצלחה', {
        description: 'היהלום התווסף למלאי שלך',
        duration: 3000,
      });
    },
    
    onError: (error: any) => {
      console.error('Failed to add diamond:', error);
      
      // Haptic feedback for error
      notificationOccurred('error');
      
      const errorMessage = error?.response?.data?.message || error?.message || 'שגיאה בהוספת היהלום';
      
      toast.error('❌ הוספת יהלום נכשלה', {
        description: errorMessage,
        duration: 5000,
      });
    },
  });
}