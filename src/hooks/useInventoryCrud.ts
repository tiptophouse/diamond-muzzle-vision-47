
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useInventoryCrud(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to validate UUID
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

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

    // Validate diamond ID
    if (!diamondId || !isValidUUID(diamondId)) {
      console.error('Invalid diamond ID:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID provided",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Updating diamond:', diamondId, 'with data:', data);
      
      // Prepare update data with proper validation
      const updateData = {
        stock_number: data.stockNumber || '',
        shape: data.shape || 'Round',
        weight: data.carat && data.carat > 0 ? data.carat : 1,
        color: data.color || 'G',
        clarity: data.clarity || 'VS1',
        cut: data.cut || 'Excellent',
        price_per_carat: data.carat > 0 ? Math.round(data.price / data.carat) : Math.round(data.price),
        status: data.status || 'Available',
        picture: data.imageUrl || null,
      };

      console.log('Supabase update data:', updateData);
      console.log('Updating diamond with ID:', diamondId, 'for user:', user.id);

      const { data: updatedData, error } = await supabase
        .from('inventory')
        .update(updateData)
        .eq('id', diamondId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('invalid input syntax for type uuid')) {
          throw new Error('Invalid ID format. Please try refreshing the page.');
        } else if (error.message.includes('row-level security')) {
          throw new Error('You do not have permission to update this diamond.');
        } else {
          throw new Error(`Database update failed: ${error.message}`);
        }
      }

      if (!updatedData) {
        throw new Error('Diamond not found or no changes were made');
      }

      console.log('Diamond updated successfully in Supabase:', updatedData);
      
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to update diamond:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
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

    // Validate diamond ID
    if (!diamondId || !isValidUUID(diamondId)) {
      console.error('Invalid diamond ID for deletion:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID provided",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Deleting diamond from FastAPI backend:', diamondId, 'for user:', user.id);
      
      const response = await api.delete(apiEndpoints.deleteDiamond(diamondId, user.id));
      
      console.log('Delete response:', response);
      
      if (response.error) {
        console.error('Delete API error:', response.error);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
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
