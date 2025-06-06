
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useAddDiamond } from './inventory/useAddDiamond';
import { useUpdateDiamond } from './inventory/useUpdateDiamond';
import { useDeleteDiamond } from './inventory/useDeleteDiamond';

export function useInventoryCrud(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { addDiamond: addDiamondFn } = useAddDiamond(onSuccess);
  const { updateDiamond: updateDiamondFn } = useUpdateDiamond(onSuccess);
  const { deleteDiamond: deleteDiamondFn } = useDeleteDiamond(onSuccess);

  const addDiamond = async (data: DiamondFormData) => {
    setIsLoading(true);
    try {
      const result = await addDiamondFn(data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    setIsLoading(true);
    try {
      const result = await updateDiamondFn(diamondId, data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiamond = async (diamondId: string) => {
    console.log('CRUD deleteDiamond called for ID:', diamondId);
    setIsLoading(true);
    try {
      const result = await deleteDiamondFn(diamondId);
      console.log('CRUD deleteDiamond result:', result);
      
      // Force an immediate refresh regardless of the result
      // This ensures the UI updates even if there are sync issues
      if (onSuccess) {
        console.log('Forcing immediate refresh after delete operation');
        setTimeout(() => onSuccess(), 100);
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
