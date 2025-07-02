
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { isValidUUID } from '@/utils/diamondUtils';
import { api, apiEndpoints } from '@/lib/api';

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

    // Validate diamond ID format
    if (!diamondId || !isValidUUID(diamondId)) {
      console.error('Invalid diamond ID format:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID format. Please refresh and try again.",
      });
      return false;
    }

    try {
      console.log('Updating diamond via API. ID:', diamondId, 'with data:', data);

      const payload: Record<string, any> = {
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
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      console.log('API update payload:', payload);

      const endpoint = apiEndpoints.updateDiamond(diamondId);
      const result = await api.put(endpoint, payload);

      if (result.error) {
        throw new Error(result.error);
      }

      console.log('Diamond updated successfully via API:', result.data);
      
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
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
};
