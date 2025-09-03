import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

export function useDeleteDiamond() {
  const queryClient = useQueryClient();
  const { notificationOccurred } = useTelegramHapticFeedback();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting diamond:', id);
      
      const response = await api.delete(`/diamonds/${id}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete diamond');
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
      
      toast.success('✅ יהלום נמחק בהצלחה', {
        description: 'היהלום הוסר מהמלאי שלך',
        duration: 3000,
      });
    },
    
    onError: (error: any) => {
      console.error('Failed to delete diamond:', error);
      
      // Haptic feedback for error
      notificationOccurred('error');
      
      const errorMessage = error?.response?.data?.message || error?.message || 'שגיאה במחיקת היהלום';
      
      toast.error('❌ מחיקת יהלום נכשלה', {
        description: errorMessage,
        duration: 5000,
      });
    },
  });
}