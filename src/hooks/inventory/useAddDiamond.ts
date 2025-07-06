
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { generateDiamondId } from '@/utils/diamondUtils';
import { supabase } from '@/integrations/supabase/client';

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
      // Match your exact FastAPI endpoint format
      const diamondDataPayload = {
        stock: data.stockNumber || "string",
        shape: data.shape?.toLowerCase() || "round brilliant",
        weight: Number(data.carat) || 1,
        color: data.color || "D",
        clarity: data.clarity || "FL",
        lab: data.lab || "string",
        certificate_number: parseInt(data.certificateNumber || '0') || 0,
        length: Number(data.length) || 1,
        width: Number(data.width) || 1,
        depth: Number(data.depth) || 1,
        ratio: Number(data.ratio) || 1,
        cut: data.cut?.toUpperCase() || "EXCELLENT",
        polish: data.polish?.toUpperCase() || "EXCELLENT",
        symmetry: data.symmetry?.toUpperCase() || "EXCELLENT",
        fluorescence: data.fluorescence?.toUpperCase() || "NONE",
        table: Number(data.tablePercentage) || 1,
        depth_percentage: Number(data.depthPercentage) || 1,
        gridle: data.gridle || "string",
        culet: data.culet?.toUpperCase() || "NONE",
        certificate_comment: data.certificateComment || "string",
        rapnet: data.rapnet ? parseInt(data.rapnet.toString()) : 0,
        price_per_carat: data.pricePerCarat ? Number(data.pricePerCarat) : (data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : 0),
        picture: data.picture || "string",
      };

      // Remove undefined keys
      Object.keys(diamondDataPayload).forEach(key => {
        if (diamondDataPayload[key] === undefined) {
          delete diamondDataPayload[key];
        }
      });
      
      console.log('➕ ADD: Sending diamond data to FastAPI:', diamondDataPayload);
      
      // Check for duplicate certificate number before uploading
      if (diamondDataPayload.certificate_number && diamondDataPayload.certificate_number !== 0) {
        const { data: existingCheck, error: checkError } = await supabase.rpc('check_certificate_exists', {
          p_certificate_number: diamondDataPayload.certificate_number,
          p_user_id: user.id
        });
        
        if (checkError) {
          console.warn('Error checking duplicate:', checkError);
        } else if (existingCheck === true) {
          toast({
            variant: "destructive",
            title: "❌ Duplicate Diamond",
            description: `Certificate ${diamondDataPayload.certificate_number} already exists in your inventory`,
          });
          return false;
        }
      }
      
      // Try FastAPI first
      try {
        const endpoint = apiEndpoints.addDiamond(user.id);
        console.log('➕ ADD: Using endpoint:', endpoint);
        
        const response = await api.post(endpoint, diamondDataPayload);
        
        if (response.error) {
          throw new Error(response.error);
        }

        console.log('✅ ADD: FastAPI response:', response.data);

        toast({
          title: "✅ Success",
          description: "Diamond added successfully to your inventory",
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.error('❌ ADD: FastAPI add failed:', apiError);
        
        // Show specific error message
        const errorMessage = apiError instanceof Error ? apiError.message : "Failed to add diamond via API";
        
        // Fallback to localStorage
        console.log('🔄 ADD: Falling back to localStorage...');
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        
        // Check for duplicate certificate number in localStorage
        if (diamondDataPayload.certificate_number && diamondDataPayload.certificate_number !== 0) {
          const duplicateExists = existingData.some((diamond: any) => 
            diamond.certificateNumber === diamondDataPayload.certificate_number.toString() ||
            parseInt(diamond.certificateNumber || '0') === diamondDataPayload.certificate_number
          );
          
          if (duplicateExists) {
            toast({
              variant: "destructive",
              title: "❌ Duplicate Diamond",
              description: `Certificate ${diamondDataPayload.certificate_number} already exists in your inventory`,
            });
            return false;
          }
        }
        
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
          title: "⚠️ Partial Success", 
          description: "Diamond added locally (API connection failed)",
          variant: "default",
        });
        
        if (onSuccess) onSuccess();
        return true;
      }
      
    } catch (error) {
      console.error('❌ ADD: Unexpected error:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      
      toast({
        variant: "destructive",
        title: "❌ Failed to Add Diamond",
        description: errorMessage,
      });
      
      return false;
    }
  };

  return { addDiamond };
}
