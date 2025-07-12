
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

  const sendTelegramNotification = async (stoneData: DiamondFormData) => {
    if (!user?.id) return;
    
    try {
      const storeUrl = `${window.location.origin}/store?stock=${stoneData.stockNumber}`;
      
      const response = await fetch('https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/send-telegram-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaGxqcWd4aGRoYmJocG9oeGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODY1NTMsImV4cCI6MjA2MzA2MjU1M30._CGnKnTyltp1lIUmmOVI1nC4jRew2WkAU-bSf22HCDE`,
        },
        body: JSON.stringify({
          telegramId: user.id,
          stoneData: {
            stockNumber: stoneData.stockNumber,
            shape: stoneData.shape,
            carat: stoneData.carat,
            color: stoneData.color,
            clarity: stoneData.clarity,
            cut: stoneData.cut,
            polish: stoneData.polish,
            symmetry: stoneData.symmetry,
            fluorescence: stoneData.fluorescence,
            pricePerCarat: stoneData.pricePerCarat,
            lab: stoneData.lab,
            certificateNumber: stoneData.certificateNumber
          },
          storeUrl
        }),
      });

      if (response.ok) {
        console.log('✅ Telegram notification sent successfully');
      } else {
        console.error('❌ Failed to send Telegram notification');
      }
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
    }
  };

  const addDiamond = async (data: DiamondFormData) => {
    console.log('➕ CRUD: Starting add diamond operation');
    setIsLoading(true);
    try {
      const result = await addDiamondFn(data);
      if (result) {
        // Send Telegram notification on successful upload
        await sendTelegramNotification(data);
      }
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
          title: "✅ Diamond Updated",
          description: "Changes saved and synced across dashboard, store, and inventory",
        });
      }
      return result;
    } catch (error) {
      console.error('❌ CRUD: Update diamond failed:', error);
      toast({
        title: "❌ Update Failed",
        description: "Failed to update diamond. Please try again.",
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
          title: "✅ Diamond Deleted",
          description: "Diamond removed from inventory, dashboard, and store",
        });
      }
      return result;
    } catch (error) {
      console.error('❌ CRUD: Delete diamond failed:', error);
      toast({
        title: "❌ Delete Failed",
        description: "Failed to delete diamond. Please try again.",
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
