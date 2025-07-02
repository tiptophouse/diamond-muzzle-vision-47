
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
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

  const { addDiamond: addDiamondFn } = useAddDiamond(onSuccess);
  const { updateDiamond: updateDiamondFn } = useUpdateDiamond(onSuccess);
  const { deleteDiamond: deleteDiamondFn } = useDeleteDiamond({ 
    onSuccess: () => {
      console.log('🔄 Diamond deleted successfully, triggering inventory change...');
      triggerInventoryChange();
      if (onSuccess) onSuccess();
    }, 
    removeDiamondFromState, 
    restoreDiamondToState 
  });

  const addDiamond = async (data: DiamondFormData) => {
    setIsLoading(true);
    try {
      const result = await addDiamondFn(data);
      if (result) {
        console.log('🔄 Diamond added successfully, triggering inventory change...');
        triggerInventoryChange();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    setIsLoading(true);
    try {
      const result = await updateDiamondFn(diamondId, data);
      if (result) {
        console.log('🔄 Diamond updated successfully, triggering inventory change...');
        triggerInventoryChange();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
    setIsLoading(true);
    try {
      console.log('🗑️ Starting diamond deletion process for ID:', diamondId);
      const result = await deleteDiamondFn(diamondId, diamondData);
      if (result) {
        console.log('✅ Diamond deletion completed successfully');
        // The triggerInventoryChange is already called in deleteDiamondFn's onSuccess callback
      } else {
        console.error('❌ Diamond deletion failed');
      }
      return result;
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
