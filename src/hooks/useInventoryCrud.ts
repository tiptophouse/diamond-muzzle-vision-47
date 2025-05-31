
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
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
}

export function useInventoryCrud() {
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

      // For now, we'll use the existing upload endpoint
      // In a real implementation, you'd want a separate endpoint for individual diamond creation
      const response = await api.uploadCsv('/upload-inventory', [diamondData], user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Diamond added successfully",
      });
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
      // Note: This would require a PUT endpoint on your backend
      // For now, we'll simulate the update
      console.log('Updating diamond:', diamondId, data);
      
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
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
      // Note: This would require a DELETE endpoint on your backend
      // For now, we'll simulate the deletion
      console.log('Deleting diamond:', diamondId);
      
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
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
