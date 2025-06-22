
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { api, apiEndpoints } from '@/lib/api';

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
      const diamondData = {
        user_id: user.id,
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: Number(data.price),
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status,
        picture: data.picture,
        certificate_number: data.certificateNumber,
        certificate_url: data.certificateUrl,
        lab: data.lab,
        store_visible: data.storeVisible,
      };

      console.log('➕ Adding diamond via FastAPI:', diamondData);
      
      const response = await api.post(apiEndpoints.addDiamond(), diamondData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success ✅",
        description: "Diamond added successfully to your inventory",
      });
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to add diamond via FastAPI:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Add Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  return { addDiamond };
}
