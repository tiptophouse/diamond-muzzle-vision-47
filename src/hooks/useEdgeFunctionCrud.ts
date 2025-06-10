
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';

export function useEdgeFunctionCrud() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createDiamond = async (data: DiamondFormData) => {
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
      console.log('Creating diamond via edge function:', data);
      
      const { data: response, error } = await supabase.functions.invoke('diamond-crud', {
        body: {
          action: 'create',
          diamondData: {
            stockNumber: data.stockNumber,
            shape: data.shape,
            carat: data.carat,
            color: data.color,
            clarity: data.clarity,
            cut: data.cut,
            price: data.price,
            status: data.status,
            imageUrl: data.imageUrl,
            store_visible: data.store_visible,
            fluorescence: data.fluorescence,
            lab: data.lab,
            certificate_number: data.certificate_number,
            polish: data.polish,
            symmetry: data.symmetry,
          },
          userId: user.id.toString(),
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to create diamond');
      }

      toast({
        title: "Success! ✨",
        description: `Diamond ${data.stockNumber} has been created successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Failed to create diamond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create diamond. Please try again.",
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
      console.log('Updating diamond via edge function:', diamondId, data);
      
      const { data: response, error } = await supabase.functions.invoke('diamond-crud', {
        body: {
          action: 'update',
          diamondId,
          diamondData: {
            stockNumber: data.stockNumber,
            shape: data.shape,
            carat: data.carat,
            color: data.color,
            clarity: data.clarity,
            cut: data.cut,
            price: data.price,
            status: data.status,
            imageUrl: data.imageUrl,
            store_visible: data.store_visible,
            fluorescence: data.fluorescence,
            lab: data.lab,
            certificate_number: data.certificate_number,
            polish: data.polish,
            symmetry: data.symmetry,
          },
          userId: user.id.toString(),
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to update diamond');
      }

      toast({
        title: "Success! ✨",
        description: `Diamond ${data.stockNumber} has been updated successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Failed to update diamond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update diamond. Please try again.",
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
      console.log('Deleting diamond via edge function:', diamondId);
      
      const { data: response, error } = await supabase.functions.invoke('diamond-crud', {
        body: {
          action: 'delete',
          diamondId,
          userId: user.id.toString(),
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete diamond');
      }

      toast({
        title: "Success",
        description: "Diamond has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Failed to delete diamond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete diamond. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getDiamonds = async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      return [];
    }

    try {
      console.log('Getting diamonds via edge function for user:', user.id);
      
      const { data: response, error } = await supabase.functions.invoke('diamond-crud', {
        body: {
          action: 'get',
          userId: user.id.toString(),
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to get diamonds');
      }

      return response.data || [];
    } catch (error) {
      console.error('Failed to get diamonds:', error);
      return [];
    }
  };

  return {
    createDiamond,
    updateDiamond,
    deleteDiamond,
    getDiamonds,
    isLoading,
  };
}
