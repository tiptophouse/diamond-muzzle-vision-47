
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

      // Validate either price or pricePerCarat is provided
      if ((!data.price || data.price <= 0) && (!data.pricePerCarat || data.pricePerCarat <= 0)) {
        toast({
          variant: "destructive",
          title: "❌ Missing Required Field",
          description: "Valid Price or Price Per Carat is required", 
        });
        return false;
      }

      // Calculate price per carat - prioritize pricePerCarat field
      const actualPricePerCarat = data.pricePerCarat && data.pricePerCarat > 0 
        ? Number(data.pricePerCarat)
        : (data.price && data.price > 0 ? Math.round(Number(data.price) / Number(data.carat)) : 0);

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
        
        // Grading details - match schema exactly with proper enum mapping
        cut: mapToApiEnum(data.cut || 'Excellent'),
        polish: mapToApiEnum(data.polish || 'Excellent'), 
        symmetry: mapToApiEnum(data.symmetry || 'Excellent'),
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

        // Treat as success if request completed without error (FastAPI may return 201 with empty body)
        toast({
          title: "✅ יהלום נוסף בהצלחה!",
          description: `אבן "${data.stockNumber}" נוספה למלאי שלך ונראית בחנות`,
        });
        
        // Send notification with direct link to the specific diamond
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const diamondUrl = `${window.location.origin}/inventory?item=${data.stockNumber}`;
          
          await supabase.functions.invoke('send-telegram-message', {
            body: {
              telegramId: user.id,
              stoneData: {
                stockNumber: data.stockNumber,
                shape: diamondDataPayload.shape,
                carat: diamondDataPayload.weight,
                color: diamondDataPayload.color,
                clarity: diamondDataPayload.clarity,
                cut: diamondDataPayload.cut,
                polish: diamondDataPayload.polish,
                symmetry: diamondDataPayload.symmetry,
                fluorescence: diamondDataPayload.fluorescence,
                pricePerCarat: diamondDataPayload.price_per_carat,
                lab: diamondDataPayload.lab,
                certificateNumber: diamondDataPayload.certificate_number
              },
              storeUrl: diamondUrl
            }
          });
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
        }
        
        if (onSuccess) onSuccess();
        return true;
        
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
          title: "❌ נכשל בהוספת יהלום",
          description: errorMessage,
        });
        
        // Fallback to localStorage with clear messaging
        console.log('🔄 ADD: Falling back to localStorage...');
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        
        // Convert to inventory format
        // Calculate realistic price before creating diamond object
        const weight = diamondDataPayload.weight || 0;
        const rawPpc = diamondDataPayload.price_per_carat || 0;
        let totalPrice = 0;
        if (rawPpc > 100 && rawPpc < 50000 && weight > 0 && weight < 20) {
          totalPrice = Math.round(rawPpc * weight);
        } else if (rawPpc > 0 && rawPpc < 1000000) {
          totalPrice = Math.round(rawPpc);
        } else {
          totalPrice = Math.round(weight * 15000);
        }

        const newDiamond = {
          id: generateDiamondId(),
          stockNumber: diamondDataPayload.stock,
          shape: diamondDataPayload.shape,
          carat: diamondDataPayload.weight,
          color: diamondDataPayload.color,
          clarity: diamondDataPayload.clarity,
          cut: diamondDataPayload.cut,
          price: totalPrice,
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
          title: "⚠️ אבן נשמרה מקומית", 
          description: `אבן "${data.stockNumber}" נשמרה במצב לא מקוון. שגיאת שרת: ${errorMessage}`,
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
