
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { LocalStorageService } from '@/services/localStorageService';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      const updates = {
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: Number(data.price),
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status,
        store_visible: data.storeVisible,
      };

      console.log('📝 Updating diamond in local storage:', diamondId, updates);
      
      const result = LocalStorageService.updateDiamond(diamondId, updates);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update diamond');
      }

      toast({
        title: "Success ✅",
        description: "Diamond updated successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to update diamond:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  return { updateDiamond };
}
