import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints, getBackendAuthToken, signInToBackend } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { roundToInteger } from '@/utils/numberUtils';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    // Check if already updating to prevent double submission
    if (isUpdating) {
      console.warn('⚠️ UPDATE: Already updating, skipping duplicate request');
      return false;
    }

    if (!user?.id) {
      console.error('❌ UPDATE: User not authenticated - BLOCKING');
      toast({
        variant: "destructive",
        title: "❌ נדרש אימות",
        description: "אנא התחבר מחדש דרך טלגרם",
      });
      return false;
    }

    // Parse and validate diamond ID
    const numericId = parseInt(diamondId);
    if (isNaN(numericId) || typeof numericId !== 'number') {
      console.error('❌ UPDATE VALIDATION FAIL: Invalid diamond_id:', diamondId);
      toast({
        variant: "destructive",
        title: "❌ שגיאת אימות",
        description: "מזהה יהלום לא תקין",
      });
      return false;
    }

    setIsUpdating(true);

    // Ensure we have a valid token before making the request
    let token = getBackendAuthToken();
    if (!token) {
      console.log('🔄 UPDATE: No token found, attempting to refresh...');
      try {
        const tg = window.Telegram?.WebApp;
        if (tg?.initData) {
          token = await signInToBackend(tg.initData);
          if (!token) {
            console.error('❌ UPDATE: Token refresh failed');
            toast({
              variant: "destructive",
              title: "❌ שגיאת אימות",
              description: "לא ניתן לחדש את ההתחברות. אנא סגור ופתח מחדש את האפליקציה.",
            });
            setIsUpdating(false);
            return false;
          }
          console.log('✅ UPDATE: Token refreshed successfully');
        } else {
          console.error('❌ UPDATE: No Telegram initData available for token refresh');
          toast({
            variant: "destructive",
            title: "❌ שגיאת אימות",
            description: "אנא פתח את האפליקציה מטלגרם",
          });
          setIsUpdating(false);
          return false;
        }
      } catch (refreshError) {
        console.error('❌ UPDATE: Token refresh error:', refreshError);
        toast({
          variant: "destructive",
          title: "❌ שגיאת אימות",
          description: "שגיאה בחידוש ההתחברות",
        });
        setIsUpdating(false);
        return false;
      }
    }

    console.info('[CRUD START]', { 
      action: 'UPDATE',
      diamondId: numericId,
      userId: user.id,
      stockNumber: data.stockNumber,
    });

    // Show loading toast
    toast({
      title: "⏳ מעדכן יהלום...",
      description: `מעדכן מלאי ${data.stockNumber}`
    });

    try {
      const endpoint = apiEndpoints.updateDiamond(numericId);
      console.log('📝 UPDATE: Using endpoint:', endpoint);
      
      // Prepare update data according to FastAPI schema - ensure all numbers are integers
      const updateData = {
        stock: data.stockNumber,
        shape: data.shape?.toLowerCase(),
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut?.toUpperCase(),
        polish: data.polish?.toUpperCase(),
        symmetry: data.symmetry?.toUpperCase(),
        fluorescence: data.fluorescence?.toUpperCase(),
        price_per_carat: data.carat > 0 ? roundToInteger(Number(data.price) / Number(data.carat)) : roundToInteger(Number(data.price)),
        status: data.status,
        store_visible: data.storeVisible,
        picture: data.picture,
        certificate_url: data.certificateUrl,
        certificate_comment: data.certificateComment,
        lab: data.lab,
        certificate_number: data.certificateNumber ? parseInt(String(data.certificateNumber)) : null,
        length: data.length ? Number(data.length) : null,
        width: data.width ? Number(data.width) : null,
        depth: data.depth ? Number(data.depth) : null,
        ratio: data.ratio ? Number(data.ratio) : null,
        table: data.tablePercentage ? Number(data.tablePercentage) : null,
        depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : null,
        gridle: data.gridle,
        culet: data.culet?.toUpperCase(),
        rapnet: data.rapnet ? Number(data.rapnet) : null,
      };

      // Remove null/undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      console.log('📝 UPDATE: Sending data to FastAPI:', updateData);
      
      const response = await api.put(endpoint, updateData);
      
      if (response.error) {
        console.error('❌ UPDATE: FastAPI returned error:', response.error);
        throw new Error(response.error);
      }

      console.info('[CRUD SUCCESS]', {
        action: 'UPDATE',
        diamondId: numericId,
        userId: user.id,
        stockNumber: data.stockNumber,
      });

      toast({
        title: "✅ יהלום עודכן בהצלחה",
        description: `מלאי ${data.stockNumber} עודכן`
      });
      
      if (onSuccess) onSuccess();
      setIsUpdating(false);
      return true;
        
    } catch (error) {
      console.error('[CRUD FAIL]', {
        action: 'UPDATE',
        diamondId: numericId,
        userId: user.id,
        stockNumber: data.stockNumber,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error ? error.message : "עדכון היהלום נכשל. אנא נסה שוב.";
      
      toast({
        variant: "destructive",
        title: "❌ עדכון יהלום נכשל",
        description: errorMessage,
        duration: 7000
      });
      
      setIsUpdating(false);
      return false;
    }
  };

  return { updateDiamond, isUpdating };
}
