
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

      // Helper function to map form values to FastAPI enum values
      const mapToApiEnum = (value: string): string => {
        const upperValue = value?.toUpperCase();
        
        // Map "FAIR" to "POOR" since FastAPI doesn't accept "FAIR"
        if (upperValue === 'FAIR') {
          return 'POOR';
        }
        
        // Valid FastAPI enum values
        const validValues = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'POOR'];
        return validValues.includes(upperValue) ? upperValue : 'EXCELLENT';
      };

      // Map form data to FastAPI format - EXACT SCHEMA MATCH for api.mazalbot.com
      const diamondDataPayload = {
        // Required fields - exact schema match
        stock: data.stockNumber.trim(),
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        certificate_number: data.certificateNumber && data.certificateNumber.trim() 
          ? parseInt(data.certificateNumber) || 0
          : 0,
        
        // Optional fields with defaults
        lab: data.lab || "GIA",
        length: data.length && data.length > 0 ? Number(data.length) : 6.5,
        width: data.width && data.width > 0 ? Number(data.width) : 6.5,
        depth: data.depth && data.depth > 0 ? Number(data.depth) : 4.0,
        ratio: data.ratio && data.ratio > 0 ? Number(data.ratio) : 1.0,
        cut: mapToApiEnum(data.cut || 'Excellent'),
        
        // Required grading fields
        polish: mapToApiEnum(data.polish || 'Excellent'), 
        symmetry: mapToApiEnum(data.symmetry || 'Excellent'),
        fluorescence: data.fluorescence?.toUpperCase() || "NONE",
        table: data.tablePercentage && data.tablePercentage > 0 ? Number(data.tablePercentage) : 60,
        depth_percentage: data.depthPercentage && data.depthPercentage > 0 ? Number(data.depthPercentage) : 62,
        gridle: data.gridle || "Medium",
        culet: data.culet?.toUpperCase() || "NONE",
        
        // Optional fields
        certificate_comment: data.certificateComment?.trim() || "",
        rapnet: data.rapnet && data.rapnet > 0 ? parseInt(data.rapnet.toString()) : 0,
        price_per_carat: actualPricePerCarat,
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
        
        // Parse and show specific backend validation errors
        let errorMessage = "Failed to add diamond via FastAPI";
        
        if (apiError instanceof Error) {
          try {
            // Try to parse structured error response
            const errorData = JSON.parse(apiError.message);
            if (errorData.detail && Array.isArray(errorData.detail)) {
              // Format validation errors from FastAPI
              const validationErrors = errorData.detail.map((err: any) => {
                const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
                return `${field}: ${err.msg}`;
              }).join(', ');
              errorMessage = `Validation errors: ${validationErrors}`;
            }
          } catch {
            // If not JSON, use the error message directly
            errorMessage = apiError.message;
          }
        }
        
        // Show specific error message to user with API details
        toast({
          variant: "destructive",
          title: "❌ Backend Validation Error",
          description: errorMessage,
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
          description: `Stone "${data.stockNumber}" saved offline. Backend error: ${errorMessage}`,
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
        title: "❌ Upload Failed",
        description: errorMessage,
      });
      
      return false;
    }
  };

  return { addDiamond };
}
