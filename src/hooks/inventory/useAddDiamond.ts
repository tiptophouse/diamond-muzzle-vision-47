
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

      // Validate at least one pricing method is provided
      const hasPrice = data.price && data.price > 0;
      const hasPricePerCarat = data.pricePerCarat && data.pricePerCarat > 0;
      const hasDiscount = data.rapnet !== undefined && data.rapnet !== null;
      
      if (!hasPrice && !hasPricePerCarat && !hasDiscount) {
        toast({
          variant: "destructive",
          title: "❌ Missing Required Field",
          description: "Please enter Total Price, Price Per Carat, or Discount %", 
        });
        return false;
      }

      // Calculate price per carat based on input method
      let actualPricePerCarat = 0;
      
      if (data.pricePerCarat && data.pricePerCarat > 0) {
        // Price per carat mode
        actualPricePerCarat = Number(data.pricePerCarat);
      } else if (data.price && data.price > 0) {
        // Total price mode - calculate per carat
        actualPricePerCarat = Math.round(Number(data.price) / Number(data.carat));
      } else if (data.rapnet !== undefined && data.rapnet !== null) {
        // Discount mode - store the discount percentage as-is
        // Backend or store will handle displaying "X% below" instead of a dollar amount
        actualPricePerCarat = Number(data.rapnet);
      }

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

        console.log('✅ ADD: FastAPI POST response:', response.data);

        // CRITICAL: Verify the stone was actually created by fetching inventory
        console.log('🔍 ADD: Verifying stone was created...');
        
        try {
          // Wait longer for database to commit (increased from 500ms to 1500ms)
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Fetch fresh inventory to verify
          const verifyEndpoint = apiEndpoints.getAllStones(user.id, 100, 0);
          const verifyResponse = await api.get(verifyEndpoint);
          
          if (verifyResponse.error) {
            console.warn('⚠️ Verification fetch failed:', verifyResponse.error);
          } else {
            const allStones = (verifyResponse.data as any[]) || [];
            const stoneExists = allStones.some((stone: any) => {
              const apiStock = (stone.stock || stone.stock_number || '').toString().trim().toLowerCase();
              const expectedStock = data.stockNumber.trim().toLowerCase();
              console.log('🔍 Comparing:', { apiStock, expectedStock, match: apiStock === expectedStock });
              return apiStock === expectedStock;
            });
            
            if (stoneExists) {
              console.log('✅ ADD: Stone verified in inventory!');
            } else {
              console.warn('⚠️ Stone not found in verification, but upload succeeded. This may be a timing issue.');
            }
          }
        } catch (verifyError) {
          console.warn('⚠️ Verification failed, but upload succeeded:', verifyError);
        }
        
        // Success! Show confirmation (even if verification had issues)
        toast({
          title: "✅ יהלום נוסף בהצלחה!",
          description: `אבן "${data.stockNumber}" נוספה למלאי, Dashboard וה-Store`,
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
        
        // Trigger inventory refresh
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
        
        localStorage.setItem('diamond_inventory', JSON.stringify(existingData));
        
        toast({
          title: "⚠️ אבן נשמרה מקומית",
          description: `אבן "${data.stockNumber}" נשמרה מקומית בלבד ולא תופיע ב-Dashboard/Inventory עד שהשרת יחזור.`,
          variant: "default",
        });
        
        // Do NOT trigger success handlers or inventory refresh on offline save
        return false;
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
