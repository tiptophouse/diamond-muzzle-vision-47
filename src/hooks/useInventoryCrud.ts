
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface DiamondFormData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
}

export function useInventoryCrud(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const diamondData = {
        ...data,
        user_id: user.id,
        id: crypto.randomUUID(),
      };

      console.log('Adding diamond:', diamondData);
      
      // Use the existing upload endpoint for individual diamond creation
      const response = await api.uploadCsv('/upload-inventory', [diamondData], user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Diamond added successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to add diamond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add diamond. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Updating diamond:', diamondId, data);
      
      // Update in Supabase inventory table
      const { error } = await supabase
        .from('inventory')
        .update({
          stock_number: data.stockNumber,
          shape: data.shape,
          weight: data.carat,
          color: data.color,
          clarity: data.clarity,
          cut: data.cut,
          price_per_carat: Math.round(data.price / data.carat),
          status: data.status,
          picture: data.imageUrl || null,
        })
        .eq('id', diamondId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to update diamond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update diamond. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiamond = async (diamondId: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Deleting diamond from FastAPI backend:', diamondId, 'for user:', user.id);
      
      // Delete from FastAPI backend
      const response = await api.delete(apiEndpoints.deleteDiamond(diamondId, user.id));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to delete diamond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete diamond. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDiamond,
    updateDiamond,
    deleteDiamond,
    isLoading,
  };
}
