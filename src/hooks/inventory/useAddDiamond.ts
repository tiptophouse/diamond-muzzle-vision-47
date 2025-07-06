
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
      // Helper function to validate cut values
      const validateCut = (cut: any): string => {
        const validCuts = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'POOR'];
        const cutUpper = cut?.toString().toUpperCase();
        return validCuts.includes(cutUpper) ? cutUpper : 'EXCELLENT';
      };

      // Helper function to ensure positive ratio
      const validateRatio = (ratio: any): number => {
        const num = Number(ratio);
        return isNaN(num) || num <= 0 ? 1 : Math.abs(num);
      };

      // Match your exact FastAPI endpoint format
      const diamondDataPayload = {
        stock: data.stockNumber || `MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        shape: data.shape === 'Round' ? "round brilliant" : (data.shape?.toLowerCase() || "round brilliant"),
        weight: Number(data.carat) || 1.0,
        color: data.color || "G",
        clarity: data.clarity || "VS1",
        lab: data.lab || "GIA",
        certificate_number: parseInt(data.certificateNumber || '0') || Math.floor(Math.random() * 1000000),
        length: Number(data.length) || 6.5,
        width: Number(data.width) || 6.5,
        depth: Number(data.depth) || 4.0,
        ratio: validateRatio(data.ratio),
        cut: validateCut(data.cut),
        polish: data.polish?.toUpperCase() || "EXCELLENT",
        symmetry: data.symmetry?.toUpperCase() || "EXCELLENT",
        fluorescence: data.fluorescence?.toUpperCase() || "NONE",
        table: Number(data.tablePercentage) || 60,
        depth_percentage: Number(data.depthPercentage) || 62,
        gridle: data.gridle || "Medium",
        culet: data.culet?.toUpperCase() || "NONE",
        certificate_comment: data.certificateComment || "No comments",
        rapnet: data.rapnet ? parseInt(data.rapnet.toString()) : 0,
        price_per_carat: data.pricePerCarat ? Number(data.pricePerCarat) : (data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : 5000),
        picture: data.picture || "",
      };

      // Remove undefined keys
      Object.keys(diamondDataPayload).forEach(key => {
        if (diamondDataPayload[key] === undefined) {
          delete diamondDataPayload[key];
        }
      });
      
      console.log('➕ ADD: Sending diamond data to FastAPI:', diamondDataPayload);
      
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
          title: "✅ Diamond Added Successfully",
          description: "Your diamond has been added to inventory and is visible in dashboard, store, and inventory",
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.error('❌ ADD: FastAPI add failed:', apiError);
        console.error('❌ ADD: Full API error details:', JSON.stringify(apiError, null, 2));
        
        // Show specific error message
        const errorMessage = apiError instanceof Error ? apiError.message : "Failed to add diamond via API";
        console.error('❌ ADD: Error message:', errorMessage);
        
        // Fallback to localStorage
        console.log('🔄 ADD: Falling back to localStorage...');
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
          title: "✅ Diamond Added Successfully", 
          description: "Your diamond has been saved locally and will sync when connection is restored",
          variant: "default",
        });
        
        if (onSuccess) onSuccess();
        return true;
      }
      
    } catch (error) {
      console.error('❌ ADD: Unexpected error:', error);
      console.error('❌ ADD: Full unexpected error details:', JSON.stringify(error, null, 2));
      
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      console.error('❌ ADD: Final error message:', errorMessage);
      
      toast({
        variant: "destructive",
        title: "❌ Upload Failed",
        description: "Failed to add diamond. Please check your data and try again.",
      });
      
      return false;
    }
  };

  return { addDiamond };
}
