
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { generateDiamondId } from '@/utils/diamondUtils';

export function useAddDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      const diamondData = {
        ...data,
        user_id: user.id,
        id: generateDiamondId(),
      };

      console.log('🔒 Secure Add: Adding diamond with generated ID:', diamondData);
      
      const response = await api.uploadCsv('/upload-inventory', [diamondData], user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "✅ Success",
        description: "Diamond added successfully to your inventory",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('❌ Failed to add diamond:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "❌ Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  return { addDiamond };
}
