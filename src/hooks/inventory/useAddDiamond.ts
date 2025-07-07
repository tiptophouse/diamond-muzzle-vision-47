
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api/config';
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
      console.log('📝 Processing form data:', data);

      // Validate required fields first
      if (!data.stockNumber?.trim()) {
        toast({
          variant: "destructive",
          title: "❌ Missing Required Field",
          description: "Stock Number is required",
        });
        return false;
      }

      if (!data.carat || data.carat <= 0) {
        toast({
          variant: "destructive",
          title: "❌ Missing Required Field", 
          description: "Valid Carat Weight is required",
        });
        return false;
      }

      if (!data.price || data.price <= 0) {
        toast({
          variant: "destructive",
          title: "❌ Missing Required Field",
          description: "Valid Price is required", 
        });
        return false;
      }

      // Calculate price per carat from actual form data
      const actualPricePerCarat = data.pricePerCarat && data.pricePerCarat > 0 
        ? Number(data.pricePerCarat)
        : Math.round(Number(data.price) / Number(data.carat));

      // Map form data to FastAPI format - EXACT SCHEMA MATCH for api.mazalbot.com
      const diamondDataPayload = {
        // Required fields - exact schema match
        stock: data.stockNumber.trim(),
        shape: data.shape === 'Round' ? "round brilliant" : data.shape.toLowerCase(),
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        
        // Certificate data - match schema exactly
        lab: data.lab || "GIA",
        certificate_number: data.certificateNumber && data.certificateNumber.trim() 
          ? parseInt(data.certificateNumber) || 0
          : 0,
        certificate_comment: data.certificateComment?.trim() || "",
        
        // Physical measurements - match schema field names
        length: data.length && data.length > 0 ? Number(data.length) : 1,
        width: data.width && data.width > 0 ? Number(data.width) : 1,
        depth: data.depth && data.depth > 0 ? Number(data.depth) : 1,
        ratio: data.ratio && data.ratio > 0 ? Number(data.ratio) : 1,
        
        // Grading details - match schema exactly
        cut: data.cut?.toUpperCase() || "EXCELLENT",
        polish: data.polish?.toUpperCase() || "EXCELLENT", 
        symmetry: data.symmetry?.toUpperCase() || "EXCELLENT",
        fluorescence: data.fluorescence?.toUpperCase() || "NONE",
        table: data.tablePercentage && data.tablePercentage > 0 ? Number(data.tablePercentage) : 1,
        depth_percentage: data.depthPercentage && data.depthPercentage > 0 ? Number(data.depthPercentage) : 1,
        gridle: data.gridle || "Medium",
        culet: data.culet?.toUpperCase() || "NONE",
        
        // Business data - match schema exactly
        price_per_carat: actualPricePerCarat,
        rapnet: data.rapnet && data.rapnet > 0 ? parseInt(data.rapnet.toString()) : 0,
        picture: data.picture?.trim() || "",
      };

      console.log('💎 Sending diamond data to FastAPI (api.mazalbot.com):', diamondDataPayload);
      
      // Try FastAPI backend at api.mazalbot.com
      try {
        const endpoint = apiEndpoints.addDiamond(user.id);
        console.log('➕ ADD: Using endpoint:', endpoint);
        console.log('➕ ADD: Making POST request to:', `${API_BASE_URL}${endpoint}`);
        
        const response = await api.post(endpoint, diamondDataPayload);
        
        if (response.error) {
          throw new Error(response.error);
        }

        console.log('✅ ADD: FastAPI response:', response.data);

        // Show success message - API call succeeded
        if (response.data) {
          toast({
            title: "✅ Diamond Added Successfully!",
            description: `Stone "${data.stockNumber}" has been added to your inventory via FastAPI backend`,
          });
          
          if (onSuccess) onSuccess();
          return true;
        } else {
          throw new Error("No data returned from FastAPI");
        }
        
      } catch (apiError) {
        console.error('❌ ADD: FastAPI add failed:', apiError);
        console.error('❌ ADD: Full API error details:', JSON.stringify(apiError, null, 2));
        
        // Show specific error message to user with API details
        const errorMessage = apiError instanceof Error ? apiError.message : "Failed to add diamond via FastAPI";
        console.error('❌ ADD: Error message:', errorMessage);
        
        // Show detailed error message for debugging
        toast({
          variant: "destructive",
          title: "❌ FastAPI Connection Failed",
          description: `Unable to connect to FastAPI backend at ${API_BASE_URL}. Stone will be saved locally.`,
        });
        
        // Fallback to localStorage with clear messaging
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
          title: "⚠️ Stone Saved Locally", 
          description: `Stone "${data.stockNumber}" saved offline. Will sync when backend connection is restored.`,
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
