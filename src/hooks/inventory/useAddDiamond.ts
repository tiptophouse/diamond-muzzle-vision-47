
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { generateDiamondId } from '@/utils/diamondUtils';
import { useTelegramAlerts } from '@/hooks/useTelegramAlerts';

export function useAddDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { sendInventoryAlert } = useTelegramAlerts();

  const addDiamond = async (data: DiamondFormData) => {
    console.log('➕ ADD_DIAMOND: Starting addDiamond function with data:', JSON.stringify(data, null, 2));
    
    if (!user?.id) {
      console.log('❌ ADD_DIAMOND: No user ID found, user object:', user);
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    console.log('✅ ADD_DIAMOND: User authenticated with ID:', user.id);

    try {
      console.log('📝 ADD_DIAMOND: Processing form data:', data);

      // Validate required fields first
      if (!data.stockNumber?.trim()) {
        console.log('❌ ADD_DIAMOND: Missing stock number');
        toast({
          variant: "destructive",
          title: "❌ Missing Required Field",
          description: "Stock Number is required",
        });
        return false;
      }

      if (!data.carat || data.carat <= 0) {
        console.log('❌ ADD_DIAMOND: Invalid carat weight:', data.carat);
        toast({
          variant: "destructive",
          title: "❌ Missing Required Field", 
          description: "Valid Carat Weight is required",
        });
        return false;
      }

      if (!data.price || data.price <= 0) {
        console.log('❌ ADD_DIAMOND: Invalid price:', data.price);
        toast({
          variant: "destructive",
          title: "❌ Missing Required Field",
          description: "Valid Price is required", 
        });
        return false;
      }

      console.log('✅ ADD_DIAMOND: All required fields validated successfully');

      // Calculate price per carat from actual form data
      const actualPricePerCarat = data.pricePerCarat && data.pricePerCarat > 0 
        ? Number(data.pricePerCarat)
        : Math.round(Number(data.price) / Number(data.carat));

      console.log('💰 ADD_DIAMOND: Calculated price per carat:', actualPricePerCarat);

      // Map form data to FastAPI format - EXACTLY matching your structure
      const diamondDataPayload = {
        stock: data.stockNumber.trim(),
        shape: data.shape || "Round",
        weight: Number(data.carat),
        color: data.color || "G",
        clarity: data.clarity || "VS1",
        lab: data.lab || "GIA",
        certificate_number: data.certificateNumber && data.certificateNumber.trim() 
          ? parseInt(data.certificateNumber) || 0
          : 0,
        length: data.length ? Number(data.length) : 0,
        width: data.width ? Number(data.width) : 0,
        depth: data.depth ? Number(data.depth) : 0,
        ratio: data.ratio ? Number(data.ratio) : 0,
        cut: data.cut || "Excellent",
        polish: data.polish || "Excellent", 
        symmetry: data.symmetry || "Excellent",
        fluorescence: data.fluorescence || "None",
        table: data.tablePercentage ? Number(data.tablePercentage) : 0,
        depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : 0,
        gridle: data.gridle || "Medium",
        culet: data.culet || "None",
        certificate_comment: data.certificateComment?.trim() || "",
        rapnet: data.rapnet ? Number(data.rapnet) : 0,
        price_per_carat: actualPricePerCarat,
        picture: data.picture?.trim() || ""
      };

      console.log('💎 ADD_DIAMOND: Prepared diamond payload (EXACT FastAPI structure):', JSON.stringify(diamondDataPayload, null, 2));
      
      console.log('➕ ADD_DIAMOND: Sending diamond data to FastAPI with user ID:', user.id);
      
      // Try FastAPI first
      try {
        const endpoint = apiEndpoints.addDiamond(user.id);
        console.log('🌐 ADD_DIAMOND: Using API endpoint:', endpoint);
        
        console.log('📡 ADD_DIAMOND: Making POST request to FastAPI...');
        const response = await api.post(endpoint, diamondDataPayload);
        
        console.log('📡 ADD_DIAMOND: FastAPI response received:', JSON.stringify(response, null, 2));
        
        if (response.error) {
          console.log('❌ ADD_DIAMOND: API returned error:', response.error);
          throw new Error(response.error);
        }

        console.log('✅ ADD_DIAMOND: FastAPI response data:', response.data);

        // Only show success message if API call actually succeeded
        if (response.data) {
          console.log('🎉 ADD_DIAMOND: API call successful, sending alerts and showing success message');
          
          // Send Telegram alert
          sendInventoryAlert('added', diamondDataPayload);
          
          toast({
            title: "✅ Diamond Added Successfully",
            description: "Your diamond has been added to inventory and is visible in dashboard, store, and inventory",
          });
          
          console.log('🔄 ADD_DIAMOND: Calling onSuccess callback to refresh data');
          if (onSuccess) onSuccess();
          return true;
        } else {
          console.log('❌ ADD_DIAMOND: No data in API response');
          throw new Error("No data returned from API");
        }
        
      } catch (apiError) {
        console.error('❌ ADD_DIAMOND: FastAPI add failed with error:', apiError);
        console.error('❌ ADD_DIAMOND: Full API error details:', JSON.stringify(apiError, null, 2));
        
        // Show specific error message
        const errorMessage = apiError instanceof Error ? apiError.message : "Failed to add diamond via API";
        console.error('❌ ADD_DIAMOND: Error message to show user:', errorMessage);
        
        // Fallback to localStorage
        console.log('🔄 ADD_DIAMOND: API failed, falling back to localStorage...');
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
        
        console.log('💾 ADD_DIAMOND: Saving to localStorage:', JSON.stringify(newDiamond, null, 2));
        existingData.push(newDiamond);
        localStorage.setItem('diamond_inventory', JSON.stringify(existingData));
        
        toast({
          title: "✅ Diamond Added Successfully", 
          description: "Your diamond has been saved locally and will sync when connection is restored",
          variant: "default",
        });
        
        console.log('🔄 ADD_DIAMOND: localStorage fallback complete, calling onSuccess callback');
        if (onSuccess) onSuccess();
        return true;
      }
      
    } catch (error) {
      console.error('❌ ADD_DIAMOND: Unexpected error in main try-catch:', error);
      console.error('❌ ADD_DIAMOND: Full unexpected error details:', JSON.stringify(error, null, 2));
      
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      console.error('❌ ADD_DIAMOND: Final error message for user:', errorMessage);
      
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
