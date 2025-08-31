
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Diamond } from '@/types/diamond';
import { useAddDiamond } from './inventory/useAddDiamond';
import { useUpdateDiamond } from './inventory/useUpdateDiamond';
import { useDeleteDiamond } from './inventory/useDeleteDiamond';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';

interface UseInventoryCrudProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

interface DiamondCreateData {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  certificate_number: number;
  lab?: string;
  length?: number;
  width?: number;
  depth?: number;
  ratio?: number;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  table: number;
  depth_percentage: number;
  gridle: string;
  culet: string;
  certificate_comment?: string;
  rapnet?: number;
  price_per_carat: number;
  picture?: string;
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

  const { addDiamond: addDiamondFn } = useAddDiamond();
  const { updateDiamond: updateDiamondFn } = useUpdateDiamond();
  const { deleteDiamond: deleteDiamondFn } = useDeleteDiamond();

  const sendTelegramNotification = async (stoneData: DiamondFormData) => {
    if (!user?.id) {
      console.log('❌ No user ID for Telegram notification');
      return;
    }
    
    try {
      console.log('📱 Sending Telegram notification for stone:', stoneData.stockNumber);
      
      let baseUrl = window.location.origin;
      
      if (baseUrl.includes('lovable.dev') || baseUrl.includes('lovableproject.com')) {
        baseUrl = 'https://miniapp.mazalbot.com';
      }
      
      const params = new URLSearchParams({
        carat: stoneData.carat.toString(),
        color: stoneData.color,
        clarity: stoneData.clarity,
        cut: stoneData.cut,
        shape: stoneData.shape,
        stock: stoneData.stockNumber,
        price: (stoneData.pricePerCarat * stoneData.carat).toString(),
      });

      if (stoneData.fluorescence) params.set('fluorescence', stoneData.fluorescence);
      if (stoneData.picture) params.set('imageUrl', stoneData.picture);
      if (stoneData.certificateUrl) params.set('certificateUrl', stoneData.certificateUrl);
      if (stoneData.lab) params.set('lab', stoneData.lab);
      if (stoneData.certificateNumber) params.set('certificateNumber', stoneData.certificateNumber);
      if (stoneData.polish) params.set('polish', stoneData.polish);
      if (stoneData.symmetry) params.set('symmetry', stoneData.symmetry);
      
      const storeUrl = `${baseUrl}/store?${params.toString()}`;
      console.log('🔗 Generated store URL with parameters:', storeUrl);
      
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
        const result = await response.json();
        console.log('✅ Telegram notification sent successfully:', result);
        toast({
          title: "📱 Telegram Sent",
          description: "Stone summary sent to your Telegram!",
        });
      } else {
        const error = await response.text();
        console.error('❌ Failed to send Telegram notification:', error);
      }
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
    }
  };

  // Transform DiamondFormData to DiamondCreateData for FastAPI
  const transformFormDataToCreateData = (data: DiamondFormData): DiamondCreateData => {
    return {
      stock: data.stockNumber,
      shape: data.shape,
      weight: data.carat,
      color: data.color,
      clarity: data.clarity,
      certificate_number: data.certificateNumber ? parseInt(data.certificateNumber) : Date.now(),
      lab: data.lab,
      length: data.length,
      width: data.width,
      depth: data.depth,
      ratio: data.ratio,
      cut: data.cut,
      polish: data.polish,
      symmetry: data.symmetry,
      fluorescence: data.fluorescence,
      table: data.tablePercentage || 0,
      depth_percentage: data.depthPercentage || 0,
      gridle: data.gridle || '',
      culet: data.culet || 'NONE',
      certificate_comment: data.certificateComment,
      rapnet: data.rapnet,
      price_per_carat: data.pricePerCarat,
      picture: data.picture,
    };
  };

  const addDiamond = async (data: DiamondFormData) => {
    console.log('➕ CRUD: Starting add diamond operation');
    setIsLoading(true);
    try {
      const createData = transformFormDataToCreateData(data);
      const result = await addDiamondFn(createData);
      if (result) {
        successHandler();
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
      const updateData = transformFormDataToCreateData(data);
      const result = await updateDiamondFn(diamondId, updateData);
      if (result) {
        successHandler();
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
      const result = await deleteDiamondFn(
        diamondId, 
        removeDiamondFromState, 
        restoreDiamondToState, 
        diamondData
      );
      if (result) {
        successHandler();
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
