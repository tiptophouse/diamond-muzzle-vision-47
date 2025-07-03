
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useAddDiamond } from './inventory/useAddDiamond';
import { useUpdateDiamond } from './inventory/useUpdateDiamond';
import { useDeleteDiamond } from './inventory/useDeleteDiamond';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';

interface UseInventoryCrudProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useInventoryCrud({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseInventoryCrudProps = {}) {
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
  const { deleteDiamond: deleteDiamondFn } = useDeleteDiamond({ 
    onSuccess: successHandler, 
    removeDiamondFromState, 
    restoreDiamondToState 
  });

  const addDiamond = async (data: DiamondFormData) => {
    console.log('➕ CRUD: Starting add diamond operation');
    setIsLoading(true);
    try {
      const result = await addDiamondFn(data);
      return result;
    } catch (error) {
      console.error('❌ CRUD: Add diamond failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    console.log('📝 CRUD: Starting update diamond operation for:', diamondId);
    setIsLoading(true);
    try {
      const result = await updateDiamondFn(diamondId, data);
      if (result) {
        console.log('✅ CRUD: Diamond updated successfully');
        toast({
          title: "Success",
          description: "Diamond updated successfully",
        });
      }
      return result;
    } catch (error) {
      console.error('❌ CRUD: Update diamond failed:', error);
      toast({
        title: "Error",
        description: "Failed to update diamond",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
    console.log('🗑️ CRUD: Starting delete diamond operation for:', diamondId);
    setIsLoading(true);
    try {
      const result = await deleteDiamondFn(diamondId, diamondData);
      if (result) {
        console.log('✅ CRUD: Diamond deleted successfully');
        toast({
          title: "Success",
          description: "Diamond deleted successfully",
        });
      }
      return result;
    } catch (error) {
      console.error('❌ CRUD: Delete diamond failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete diamond",
        variant: "destructive",
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
