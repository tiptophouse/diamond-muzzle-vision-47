
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { roundToInteger } from '@/utils/numberUtils';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      console.error('❌ UPDATE: User not authenticated - BLOCKING');
      toast({
        variant: "destructive",
        title: "❌ Authentication Error",
        description: 'User authentication required to update diamonds',
      });
      return false;
    }

    // Parse and validate diamond ID
    const numericId = parseInt(diamondId);
    if (isNaN(numericId) || typeof numericId !== 'number') {
      console.error('❌ UPDATE VALIDATION FAIL: Invalid diamond_id');
      toast({
        variant: "destructive",
        title: "❌ Validation Error",
        description: 'Invalid diamond ID',
      });
      return false;
    }

    console.info('[CRUD START]', { 
      action: 'UPDATE',
      diamondId: numericId,
      userId: user.id,
      stockNumber: data.stockNumber,
      payload: JSON.stringify(data).substring(0, 500)
    });

    // Show loading toast
    toast({
      title: "⏳ Updating Diamond...",
      description: `Updating stock ${data.stockNumber}`
    });

    try {
      console.log('📝 UPDATE: Starting update for diamond:', numericId);
      console.log('📝 UPDATE: Form data received:', data);
      
      const endpoint = apiEndpoints.updateDiamond(numericId);
      console.log('📝 UPDATE: Using endpoint:', endpoint);
      console.log('📝 UPDATE: User ID:', user.id, 'type:', typeof user.id);
      console.log('📝 UPDATE: Diamond ID:', numericId, 'type:', typeof numericId);
      
      // Prepare update data according to FastAPI schema - ensure all numbers are integers
      const updateData = {
        stock: data.stockNumber,
        shape: data.shape?.toLowerCase(),
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut?.toUpperCase(),
        polish: data.polish?.toUpperCase(),
        symmetry: data.symmetry?.toUpperCase(),
        fluorescence: data.fluorescence?.toUpperCase(),
        price_per_carat: data.carat > 0 ? roundToInteger(Number(data.price) / Number(data.carat)) : roundToInteger(Number(data.price)),
        status: data.status,
        store_visible: data.storeVisible,
        picture: data.picture,
        certificate_url: data.certificateUrl,
        certificate_comment: data.certificateComment,
        lab: data.lab,
        certificate_number: data.certificateNumber ? parseInt(String(data.certificateNumber)) : null,
        length: data.length ? Number(data.length) : null,
        width: data.width ? Number(data.width) : null,
        depth: data.depth ? Number(data.depth) : null,
        ratio: data.ratio ? Number(data.ratio) : null,
        table: data.tablePercentage ? Number(data.tablePercentage) : null,
        depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : null,
        gridle: data.gridle,
        culet: data.culet?.toUpperCase(),
        rapnet: data.rapnet ? Number(data.rapnet) : null,
        // Add the total price field that FastAPI expects
        price: roundToInteger(Number(data.price)),
      };

      // Remove null/undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      console.log('📝 UPDATE: Sending data to FastAPI (all integers):', updateData);
      
      const response = await api.put(endpoint, updateData);
      
      if (response.error) {
        console.error('❌ UPDATE: FastAPI returned error:', response.error);
        const errorDetails = {
          error: response.error,
          data: response.data
        };
        const error = new Error(response.error);
        (error as any).responseDetails = errorDetails;
        throw error;
      }

      console.info('[CRUD SUCCESS]', {
        action: 'UPDATE',
        diamondId: numericId,
        userId: user.id,
        stockNumber: data.stockNumber,
        response: response.data
      });

      toast({
        title: "✅ Diamond Updated Successfully",
        description: `Stock ${data.stockNumber} updated`
      });
      
      if (onSuccess) onSuccess();
      return true;
        
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      const responseDetails = (error as any)?.responseDetails;
      
      console.error('[CRUD FAIL]', {
        action: 'UPDATE',
        diamondId: numericId,
        userId: user.id,
        stockNumber: data.stockNumber,
        error: errorMessage,
        responseDetails,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      // Build detailed alert message
      let alertMessage = `❌ UPDATE DIAMOND FAILED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 REQUEST DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Endpoint: PUT /api/v1/diamonds/${numericId}
Stock Number: ${data.stockNumber}
Diamond ID: ${numericId}
User ID: ${user.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ ERROR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${errorMessage}`;

      // Add server response if available
      if (responseDetails) {
        alertMessage += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 SERVER RESPONSE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        if (responseDetails.data) {
          alertMessage += `\nResponse Data: ${JSON.stringify(responseDetails.data, null, 2)}`;
        }
        
        if (responseDetails.error) {
          alertMessage += `\nError Details: ${responseDetails.error}`;
        }
      }
      
      alertMessage += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Timestamp: ${new Date().toISOString()}`;
      
      // Show detailed alert
      alert(alertMessage);
      
      toast({
        variant: "destructive",
        title: "❌ Update Diamond Failed",
        description: errorMessage,
        duration: 5000
      });
      
      return false;
    }
  };

  return { updateDiamond };
}
