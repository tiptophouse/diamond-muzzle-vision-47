
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
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
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      const diamondDataPayload: Record<string, any> = {
        id: generateDiamondId(),
        user_id: user.id,
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status,
        picture: data.picture,
        certificate_number: data.certificateNumber,
        certificate_url: data.certificateUrl,
        certificate_comment: data.certificateComment,
        lab: data.lab,
        length: data.length,
        width: data.width,
        depth: data.depth,
        ratio: data.ratio,
        table_percentage: data.tablePercentage,
        depth_percentage: data.depthPercentage,
        fluorescence: data.fluorescence,
        polish: data.polish,
        symmetry: data.symmetry,
        gridle: data.gridle,
        culet: data.culet,
        rapnet: data.rapnet,
        store_visible: data.storeVisible,
      };

      // Remove undefined keys to only send fields with values
      Object.keys(diamondDataPayload).forEach(key => {
        if (diamondDataPayload[key] === undefined) {
          delete diamondDataPayload[key];
        }
      });
      
      console.log('Adding diamond via API with data:', diamondDataPayload);
      
      const endpoint = apiEndpoints.addDiamond();
      const response = await api.post(endpoint, {
        diamond_data: diamondDataPayload
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Diamond added successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to add diamond:', error);
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
