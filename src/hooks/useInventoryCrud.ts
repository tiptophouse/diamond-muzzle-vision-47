
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
    setIsLoading(true);
    try {
      const result = await deleteDiamondFn(diamondId);
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
