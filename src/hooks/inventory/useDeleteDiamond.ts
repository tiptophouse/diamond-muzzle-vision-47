import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps = {}) {
  const queryClient = useQueryClient();
  const { notificationOccurred } = useTelegramHapticFeedback();

  const deleteDiamond = async (id: string, diamondData?: Diamond): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting diamond:', id);
      
      // Optimistically remove from UI
      if (removeDiamondFromState) {
        removeDiamondFromState(id);
      }
      
      const response = await api.delete(`/diamonds/${id}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
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

      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error('Failed to delete diamond:', error);
      
      // Restore diamond to UI on error
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      // Haptic feedback for error
      notificationOccurred('error');
      
      const errorMessage = error?.response?.data?.message || error?.message || 'שגיאה במחיקת היהלום';
      
      toast.error('❌ מחיקת יהלום נכשלה', {
        description: errorMessage,
        duration: 5000,
      });

      return false;
    }
  };

  return { deleteDiamond };
}