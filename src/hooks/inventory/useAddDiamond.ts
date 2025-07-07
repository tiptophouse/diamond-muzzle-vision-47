
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
      throw new Error("User not authenticated");
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

      // Match the exact FastAPI endpoint format
      const diamondPayload = {
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
      Object.keys(diamondPayload).forEach(key => {
        if (diamondPayload[key] === undefined) {
          delete diamondPayload[key];
        }
      });
      
      console.log('➕ ADD: Sending diamond data to FastAPI:', diamondPayload);
      
      const endpoint = apiEndpoints.addDiamond(user.id);
      console.log('➕ ADD: Using endpoint:', endpoint);
      
      const response = await api.post(endpoint, diamondPayload);
      
      // Enhanced error handling for non-200 responses
      if (response.error) {
        console.error('❌ ADD: API error:', response.error);
        
        // Show detailed error message to user
        toast({
          title: "❌ Upload Failed",
          description: `API Error: ${response.error}`,
          variant: "destructive",
        });
        
        throw new Error(`API Error: ${response.error}`);
      }

      console.log('✅ ADD: FastAPI response:', response.data);

      // Only show success message if API call actually succeeded
      if (response.data) {
        toast({
          title: "✅ Success",
          description: "Diamond has been added to your inventory successfully!",
        });
        
        if (onSuccess) onSuccess();
        return true;
      } else {
        const errorMsg = "No data returned from API - the diamond may not have been saved";
        toast({
          title: "❌ Upload Failed",
          description: errorMsg,
          variant: "destructive",
        });
        throw new Error(errorMsg);
      }
        
    } catch (apiError) {
      console.error('❌ ADD: API operation failed:', apiError);
      
      // Enhanced error handling with specific error messages
      let errorMessage = "An unexpected error occurred";
      let toastTitle = "❌ Upload Failed";
      
      if (apiError instanceof Error) {
        if (apiError.message.includes('Failed to fetch') || apiError.message.includes('NetworkError')) {
          errorMessage = "Network error: Cannot connect to server. Please check your internet connection and try again.";
          toastTitle = "🌐 Connection Error";
        } else if (apiError.message.includes('API Error:')) {
          errorMessage = apiError.message;
          toastTitle = "🔴 Server Error";
        } else if (apiError.message.includes('401')) {
          errorMessage = "Authentication failed. Please log in again.";
          toastTitle = "🔐 Authentication Error";
        } else if (apiError.message.includes('403')) {
          errorMessage = "Access denied. You don't have permission to perform this action.";
          toastTitle = "🚫 Access Denied";
        } else if (apiError.message.includes('400')) {
          errorMessage = "Invalid data provided. Please check your input and try again.";
          toastTitle = "📝 Invalid Data";
        } else if (apiError.message.includes('500')) {
          errorMessage = "Server internal error. Please try again later or contact support.";
          toastTitle = "⚠️ Server Error";
        } else {
          errorMessage = `Server error: ${apiError.message}`;
        }
      }
      
      // Show error toast to user
      toast({
        title: toastTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Fallback to localStorage as last resort
      console.log('🔄 ADD: Falling back to localStorage...');
      try {
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        
        const newDiamond = {
          id: generateDiamondId(),
          stockNumber: diamondPayload.stock,
          shape: diamondPayload.shape,
          carat: diamondPayload.weight,
          color: diamondPayload.color,
          clarity: diamondPayload.clarity,
          cut: diamondPayload.cut,
          price: diamondPayload.price_per_carat * diamondPayload.weight,
          status: 'Available',
          store_visible: true,
          certificateNumber: diamondPayload.certificate_number.toString(),
          certificateUrl: diamondPayload.picture,
          lab: diamondPayload.lab,
          user_id: user.id,
          created_at: new Date().toISOString()
        };
        
        existingData.push(newDiamond);
        localStorage.setItem('diamond_inventory', JSON.stringify(existingData));
        
        toast({
          title: "⚠️ Saved Locally", 
          description: "Diamond saved locally. Server connection failed - will sync when connection is restored.",
          variant: "default",
        });
        
        if (onSuccess) onSuccess();
        return true;
      } catch (localError) {
        console.error('❌ ADD: Local storage fallback failed:', localError);
        const fallbackError = "Failed to save diamond both online and locally. Please try again.";
        
        toast({
          title: "❌ Complete Failure",
          description: fallbackError,
          variant: "destructive",
        });
        
        throw new Error(fallbackError);
      }
    }
  };

  return { addDiamond };
}
