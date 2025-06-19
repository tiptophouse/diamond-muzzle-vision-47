
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { DiamondFormData } from "@/components/inventory/form/types";

export function useAddDiamond(onSuccess?: () => void) {
  const { toast } = useToast();

  const addDiamond = async (data: DiamondFormData): Promise<boolean> => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.error('❌ ADD: No user ID available');
      toast({
        variant: "destructive",
        title: "הוספת אבן נכשלה",
        description: "User authentication required. Please log in and try again.",
      });
      return false;
    }

    console.log('➕ ADD: Starting diamond addition process:', {
      stockNumber: data.stockNumber,
      shape: data.shape,
      carat: data.carat,
      userId
    });

    try {
      // Transform form data to match FastAPI expected format
      const diamondPayload = {
        user_id: userId,
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price_per_carat: Math.round(data.price / data.carat),
        status: data.status || 'Available',
        store_visible: data.storeVisible || false,
        certificate_number: data.certificateNumber || null,
        certificate_url: data.certificateUrl || null,
        lab: data.lab || null,
        picture: null // Will be handled separately if needed
      };

      console.log('➕ ADD: Sending diamond payload to FastAPI:', diamondPayload);
      
      const response = await api.post(apiEndpoints.addDiamond(), diamondPayload);
      
      if (response.error) {
        console.error('❌ ADD: FastAPI addition failed:', response.error);
        toast({
          variant: "destructive",
          title: "הוספת אבן נכשלה",
          description: `Failed to add diamond: ${response.error}`,
        });
        return false;
      }

      console.log('✅ ADD: Diamond added successfully to FastAPI backend');
      
      // Show success message
      toast({
        title: "אבן נוספה בהצלחה!",
        description: `Diamond ${data.stockNumber} has been successfully added to your inventory.`,
      });

      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error('❌ ADD: Unexpected error during addition:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        variant: "destructive",
        title: "הוספת אבן נכשלה",
        description: `Failed to add diamond: ${errorMessage}`,
      });
      
      return false;
    }
  };

  return { addDiamond };
}
