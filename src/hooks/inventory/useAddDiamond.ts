import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

export function useAddDiamond(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { notificationOccurred } = useTelegramHapticFeedback();

  const addDiamond = async (diamondData: any): Promise<boolean> => {
    try {
      console.log('💎 Adding diamond:', diamondData);
      
      const response = await api.post('/diamonds', diamondData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
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

      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error('Failed to add diamond:', error);
      
      // Haptic feedback for error
      notificationOccurred('error');
      
      const errorMessage = error?.response?.data?.message || error?.message || 'שגיאה בהוספת היהלום';
      
      toast.error('❌ הוספת יהלום נכשלה', {
        description: errorMessage,
        duration: 5000,
      });

      return false;
    }
  };

  return { addDiamond };
}