
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
      console.log('📝 UPDATE: Starting update for diamond:', diamondId);
      
      // Try FastAPI first - PUT /api/v1/diamonds/{diamond_id}
      try {
        // Use the FastAPI diamond ID if it's a number, otherwise use the provided ID
        const fastApiDiamondId = /^\d+$/.test(diamondId) ? diamondId : diamondId;
        const endpoint = apiEndpoints.updateDiamond(fastApiDiamondId);
        console.log('📝 UPDATE: Using endpoint:', endpoint);
        
        // Prepare update data according to FastAPI schema
        const updateData = {
          stock_number: data.stockNumber,
          shape: data.shape?.toLowerCase(),
          weight: Number(data.carat),
          color: data.color,
          clarity: data.clarity,
          cut: data.cut?.toUpperCase(),
          polish: data.polish?.toUpperCase(),
          symmetry: data.symmetry?.toUpperCase(),
          fluorescence: data.fluorescence?.toUpperCase(),
          price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
          status: data.status,
          store_visible: data.storeVisible,
          picture: data.picture,
          certificate_url: data.certificateUrl,
          certificate_comment: data.certificateComment,
          lab: data.lab,
          certificate_number: data.certificateNumber ? parseInt(data.certificateNumber) : null,
          length: data.length ? Number(data.length) : null,
          width: data.width ? Number(data.width) : null,
          depth: data.depth ? Number(data.depth) : null,
          ratio: data.ratio ? Number(data.ratio) : null,
          table: data.tablePercentage ? Number(data.tablePercentage) : null,
          depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : null,
          gridle: data.gridle,
          culet: data.culet?.toUpperCase(),
          rapnet: data.rapnet ? Number(data.rapnet) : null,
        };

        // Remove null/undefined values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === null || updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        console.log('📝 UPDATE: Sending data:', updateData);
        
        const response = await api.put(endpoint, updateData);
        
        if (response.error) {
          throw new Error(response.error);
        }

        console.log('✅ UPDATE: FastAPI response:', response.data);

        toast({
          title: "✅ Success",
          description: "Diamond updated successfully",
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.error('❌ UPDATE: FastAPI update failed:', apiError);
        
        // Fallback to localStorage
        console.log('🔄 UPDATE: Falling back to localStorage...');
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
            title: "⚠️ Partial Success",
            description: "Diamond updated locally (API connection failed)",
          });
          
          if (onSuccess) onSuccess();
          return true;
        } else {
          throw new Error('Diamond not found in local storage');
        }
      }
      
    } catch (error) {
      console.error('❌ UPDATE: Unexpected error:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      
      toast({
        variant: "destructive",
        title: "❌ Failed to Update Diamond",
        description: errorMessage,
      });
      
      return false;
    }
  };

  return { updateDiamond };
}
