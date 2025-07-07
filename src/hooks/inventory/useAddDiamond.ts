
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData, DiamondApiPayload } from '@/components/inventory/form/types';

export function useAddDiamond(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useTelegramAuth();

  const addDiamond = async (data: DiamondFormData): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "❌ Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    console.log('➕ ADD DIAMOND: Starting add operation for user:', user.id);

    try {
      // Map form data to API payload
      const payload: DiamondApiPayload = {
        stock: data.stock,
        shape: data.shape,
        weight: data.weight,
        color: data.color,
        clarity: data.clarity,
        lab: data.lab,
        certificate_number: data.certificate_number,
        length: data.length,
        width: data.width,
        depth: data.depth,
        ratio: data.ratio,
        cut: data.cut,
        polish: data.polish,
        symmetry: data.symmetry,
        fluorescence: data.fluorescence,
        table: data.table,
        depth_percentage: data.depth_percentage,
        gridle: data.gridle,
        culet: data.culet,
        certificate_comment: data.certificate_comment,
        rapnet: data.rapnet,
        price_per_carat: data.price_per_carat,
        picture: data.picture,
      };

      console.log('📤 ADD DIAMOND: Sending payload to FastAPI:', payload);

      const response = await fetch(`/api/v1/diamonds?user_id=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 ADD DIAMOND: FastAPI response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ ADD DIAMOND: Success!', result);

        toast({
          title: "✅ Success!",
          description: `Diamond "${data.stock}" has been successfully added to your inventory`,
        });

        if (onSuccess) {
          onSuccess();
        }

        return true;
      } else {
        // Handle different error status codes
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || errorData?.message || `Server error: ${response.status}`;
        
        console.error('❌ ADD DIAMOND: API error:', errorMessage);
        
        if (response.status === 400) {
          toast({
            title: "❌ Upload Failed - Invalid Data",
            description: "Please check your diamond details and try again. Some fields may have invalid values.",
            variant: "destructive",
          });
        } else if (response.status === 401) {
          toast({
            title: "❌ Upload Failed - Authentication",
            description: "Please log in again to add diamonds to your inventory.",
            variant: "destructive",
          });
        } else if (response.status === 403) {
          toast({
            title: "❌ Upload Failed - Access Denied",
            description: "You don't have permission to add diamonds. Please contact support.",
            variant: "destructive",
          });
        } else if (response.status >= 500) {
          toast({
            title: "❌ Upload Failed - Server Error",
            description: "Our server is experiencing issues. Please try again in a few minutes.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "❌ Upload Failed",
            description: `Failed to add diamond: ${errorMessage}`,
            variant: "destructive",
          });
        }
        
        return false;
      }

    } catch (error) {
      console.error('❌ ADD DIAMOND: Network error:', error);
      
      // Fallback: Try to save locally if FastAPI is not reachable
      try {
        console.log('🔄 ADD DIAMOND: FastAPI unreachable, saving locally...');
        
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        const newDiamond = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          stockNumber: data.stock,
          shape: data.shape,
          carat: data.weight,
          color: data.color,
          clarity: data.clarity,
          cut: data.cut,
          price: data.price_per_carat * data.weight,
          status: 'Available',
          store_visible: true,
          certificateNumber: data.certificate_number?.toString(),
          lab: data.lab,
          user_id: user.id
        };
        
        existingData.push(newDiamond);
        localStorage.setItem('diamond_inventory', JSON.stringify(existingData));
        
        toast({
          title: "⚠️ Stored Locally",
          description: `Diamond "${data.stock}" saved locally. Will sync when server is available.`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      } catch (localError) {
        console.error('❌ ADD DIAMOND: Local storage failed:', localError);
        
        toast({
          title: "❌ Upload Failed - Connection Error",
          description: "Cannot reach server and local storage failed. Please check your connection and try again.",
          variant: "destructive",
        });
        
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDiamond,
    isLoading,
  };
}
