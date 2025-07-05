
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useAddDiamond } from './inventory/useAddDiamond';
import { useUpdateDiamond } from './inventory/useUpdateDiamond';
import { useDeleteDiamond } from './inventory/useDeleteDiamond';

interface UseInventoryCrudProps {
  onSuccess?: () => void;
  onRefreshInventory?: () => void;
}

export function useInventoryCrud({ onSuccess, onRefreshInventory }: UseInventoryCrudProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  const successHandler = () => {
    console.log('🔄 CRUD: Operation successful');
    if (onSuccess) onSuccess();
  };

  const { addDiamond: addDiamondFn } = useAddDiamond({ 
    onSuccess: successHandler, 
    onRefreshInventory 
  });
  const { updateDiamond: updateDiamondFn } = useUpdateDiamond({ 
    onSuccess: successHandler, 
    onRefreshInventory 
  });
  const { deleteDiamond: deleteDiamondFn } = useDeleteDiamond({ 
    onSuccess: successHandler, 
    onRefreshInventory 
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
      return result;
    } catch (error) {
      console.error('❌ CRUD: Update diamond failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiamond = async (diamondId: string) => {
    console.log('🗑️ CRUD: Starting delete diamond operation for:', diamondId);
    setIsLoading(true);
    try {
      const result = await deleteDiamondFn(diamondId);
      return result;
    } catch (error) {
      console.error('❌ CRUD: Delete diamond failed:', error);
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
