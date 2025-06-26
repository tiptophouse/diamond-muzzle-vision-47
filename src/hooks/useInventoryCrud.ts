
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useAddDiamond } from './inventory/useAddDiamond';
import { useUpdateDiamond } from './inventory/useUpdateDiamond';
import { useDeleteDiamond } from './inventory/useDeleteDiamond';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';

interface UseInventoryCrudProps {
  onSuccess?: () => void;
}

export function useInventoryCrud({ onSuccess }: UseInventoryCrudProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { triggerInventoryChange } = useInventoryDataSync();

  const successHandler = () => {
    console.log('🔄 CRUD: Operation successful, triggering inventory change...');
    triggerInventoryChange();
    if (onSuccess) onSuccess();
  };

  const { addDiamond: addDiamondFn } = useAddDiamond(successHandler);
  const { updateDiamond: updateDiamondFn } = useUpdateDiamond(successHandler);
  const { deleteDiamond: deleteDiamondFn } = useDeleteDiamond();

  const addDiamond = async (data: DiamondFormData) => {
    console.log('➕ CRUD: Starting add diamond operation');
    setIsLoading(true);
    try {
      await addDiamondFn(data);
      console.log('✅ CRUD: Diamond added successfully');
      toast({
        title: "Success ✅",
        description: "Diamond added successfully to your inventory",
      });
      successHandler();
      return true;
    } catch (error) {
      console.error('❌ CRUD: Add diamond failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Add Failed ❌",
        description: errorMessage,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    console.log('📝 CRUD: Starting update diamond operation for:', diamondId);
    setIsLoading(true);
    try {
      await updateDiamondFn(diamondId, data);
      console.log('✅ CRUD: Diamond updated successfully');
      toast({
        title: "Success ✅",
        description: "Diamond updated successfully",
      });
      successHandler();
      return true;
    } catch (error) {
      console.error('❌ CRUD: Update diamond failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Update Failed ❌",
        description: errorMessage,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiamond = async (diamondId: string) => {
    console.log('🗑️ CRUD: Starting delete diamond operation for:', diamondId);
    setIsLoading(true);
    try {
      await deleteDiamondFn(diamondId);
      console.log('✅ CRUD: Diamond deleted successfully');
      toast({
        title: "Success ✅",
        description: "Diamond deleted successfully from your inventory",
      });
      successHandler();
      return true;
    } catch (error) {
      console.error('❌ CRUD: Delete diamond failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Delete Failed ❌",
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
