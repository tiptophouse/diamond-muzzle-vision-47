
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData, DiamondApiPayload } from '@/components/inventory/form/types';

export function useAddDiamond(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
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

      const response = await fetch(`/api/v1/diamonds?user_id=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || errorData?.message || `Server error: ${response.status}`;
        
        console.error('❌ ADD DIAMOND: API error:', errorMessage);
        
        if (response.status === 400) {
          toast({
            title: "❌ Invalid Data",
            description: "Please check your input and try again",
            variant: "destructive",
          });
        } else if (response.status === 401) {
          toast({
            title: "❌ Authentication Failed",
            description: "Please log in again",
            variant: "destructive",
          });
        } else if (response.status === 403) {
          toast({
            title: "❌ Access Denied",
            description: "You don't have permission to add diamonds",
            variant: "destructive",
          });
        } else {
          toast({
            title: "❌ Server Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        return false;
      }

      const result = await response.json();
      console.log('✅ ADD DIAMOND: Success!', result);

      toast({
        title: "✅ Diamond Added Successfully",
        description: `Diamond ${data.stock} has been added to your inventory`,
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error('❌ ADD DIAMOND: Network error:', error);
      
      toast({
        title: "❌ Network Error",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDiamond,
    isLoading,
  };
}
