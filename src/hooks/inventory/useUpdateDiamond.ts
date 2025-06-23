
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';

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
      // Try FastAPI first
      try {
        const endpoint = apiEndpoints.updateDiamond(diamondId);
        const response = await api.put(endpoint, {
          diamond_data: {
            stock_number: data.stockNumber,
            shape: data.shape,
            weight: Number(data.carat),
            color: data.color,
            clarity: data.clarity,
            cut: data.cut,
            price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
            status: data.status,
            store_visible: data.storeVisible,
          }
        });
        
        if (response.error) {
          throw new Error(response.error);
        }

        toast({
          title: "Success",
          description: "Diamond updated successfully",
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.warn('FastAPI update failed, using localStorage:', apiError);
        
        // Fallback to localStorage
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        const index = existingData.findIndex((item: any) => item.id === diamondId);
        
        if (index !== -1) {
          existingData[index] = {
            ...existingData[index],
            stockNumber: data.stockNumber,
            shape: data.shape,
            carat: Number(data.carat),
            color: data.color,
            clarity: data.clarity,
            cut: data.cut,
            price: Number(data.price),
            status: data.status,
            store_visible: data.storeVisible,
            updated_at: new Date().toISOString()
          };
          
          localStorage.setItem('diamond_inventory', JSON.stringify(existingData));
          
          toast({
            title: "Success",
            description: "Diamond updated successfully (stored locally)",
          });
          
          if (onSuccess) onSuccess();
          return true;
        } else {
          throw new Error('Diamond not found in local storage');
        }
      }
      
    } catch (error) {
      console.error('Failed to update diamond:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    }
  };

  return { updateDiamond };
}
