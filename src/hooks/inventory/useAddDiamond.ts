
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
      // Match FastAPI DiamondCreateRequest schema exactly
      const diamondDataPayload = {
        stock: data.stockNumber,
        shape: data.shape?.toLowerCase() || 'round brilliant',
        weight: Number(data.carat) || 1,
        color: data.color || 'G',
        clarity: data.clarity || 'VS1',
        lab: data.lab || 'GIA',
        certificate_number: parseInt(data.certificateNumber || '0') || Math.floor(Math.random() * 1000000),
        length: Number(data.length) || 6.5,
        width: Number(data.width) || 6.5,
        depth: Number(data.depth) || 4.0,
        ratio: Number(data.ratio) || 1.0,
        cut: data.cut?.toUpperCase() || 'EXCELLENT',
        polish: data.polish?.toUpperCase() || 'EXCELLENT',
        symmetry: data.symmetry?.toUpperCase() || 'EXCELLENT',
        fluorescence: data.fluorescence?.toUpperCase() || 'NONE',
        table: Number(data.tablePercentage) || 60,
        depth_percentage: Number(data.depthPercentage) || 62,
        gridle: data.gridle || 'Medium',
        culet: data.culet?.toUpperCase() || 'NONE',
        certificate_comment: data.certificateComment || null,
        rapnet: data.rapnet ? parseInt(data.rapnet.toString()) : null,
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)) || null,
        picture: data.picture || null,
      };

      // Remove undefined keys
      Object.keys(diamondDataPayload).forEach(key => {
        if (diamondDataPayload[key] === undefined) {
          delete diamondDataPayload[key];
        }
      });
      
      console.log('Adding diamond via API with data:', diamondDataPayload);
      
      // Try FastAPI first
      try {
        const endpoint = apiEndpoints.addDiamond();
        console.log('➕ ADD: Using endpoint:', endpoint, 'with data:', diamondDataPayload);
        
        // Send data directly as per FastAPI schema
        const response = await api.post(endpoint, diamondDataPayload);
        
        if (response.error) {
          throw new Error(response.error);
        }

        toast({
          title: "Success",
          description: "Diamond added successfully to backend",
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.warn('FastAPI add failed, using localStorage:', apiError);
        
        // Fallback to localStorage
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        
        // Convert to inventory format
        const newDiamond = {
          id: generateDiamondId(),
          stockNumber: diamondDataPayload.stock,
          shape: diamondDataPayload.shape,
          carat: diamondDataPayload.weight,
          color: diamondDataPayload.color,
          clarity: diamondDataPayload.clarity,
          cut: diamondDataPayload.cut,
          price: diamondDataPayload.price_per_carat * diamondDataPayload.weight,
          status: 'Available',
          store_visible: true,
          certificateNumber: diamondDataPayload.certificate_number.toString(),
          certificateUrl: diamondDataPayload.picture,
          lab: diamondDataPayload.lab,
          user_id: user.id,
          created_at: new Date().toISOString()
        };
        
        existingData.push(newDiamond);
        localStorage.setItem('diamond_inventory', JSON.stringify(existingData));
        
        toast({
          title: "Success",
          description: "Diamond added successfully (stored locally)",
        });
        
        if (onSuccess) onSuccess();
        return true;
      }
      
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
