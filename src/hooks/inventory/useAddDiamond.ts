
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { LocalStorageService } from '@/services/localStorageService';
import { getCurrentUserId } from '@/lib/api';

export function useAddDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      const userId = getCurrentUserId() || user.id;
      
      const diamondData = {
        user_id: userId,
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: Number(data.price),
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status,
        picture: data.picture || '',
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || '',
        store_visible: data.storeVisible,
      };

      console.log('➕ Adding diamond to local storage:', diamondData);
      
      const result = LocalStorageService.addDiamond(diamondData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add diamond');
      }

      toast({
        title: "Success ✅",
        description: "Diamond added successfully to your inventory",
      });
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to add diamond:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    }
  };

  return { addDiamond };
}
