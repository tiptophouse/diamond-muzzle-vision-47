
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/api';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseCrudOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface DiamondFormData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  certificateNumber?: string;
  certificateUrl?: string;
  lab?: string;
  status?: string;
  storeVisible?: boolean;
}

export function useInventoryCrud({ onSuccess, onError }: UseCrudOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const addDiamond = useCallback(async (data: DiamondFormData): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔄 CRUD: Adding new diamond with data:', data);
    
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        const errorMsg = 'User not authenticated for diamond creation';
        console.error('❌ CRUD:', errorMsg);
        toast.error('Authentication required to add diamonds');
        onError?.(errorMsg);
        return false;
      }

      const diamondPayload = {
        user_id: userId,
        stock_number: data.stockNumber,
        shape: data.shape,
        carat: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: data.price,
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || '',
        status: data.status || 'available',
        store_visible: data.storeVisible ?? true,
      };

      console.log('📤 CRUD: Sending diamond payload to FastAPI:', diamondPayload);
      
      const response = await api.post('/diamonds', diamondPayload);
      
      if (response.error) {
        console.error('❌ CRUD: FastAPI error when adding diamond:', response.error);
        toast.error(`Failed to add diamond: ${response.error}`);
        onError?.(response.error);
        return false;
      }
      
      console.log('✅ CRUD: Diamond added successfully:', response.data);
      toast.success(`Diamond ${data.stockNumber} added successfully!`);
      onSuccess?.();
      return true;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ CRUD: Exception when adding diamond:', error);
      toast.error(`Failed to add diamond: ${errorMsg}`);
      onError?.(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const updateDiamond = useCallback(async (diamondId: string, data: Partial<DiamondFormData>): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔄 CRUD: Updating diamond ID:', diamondId, 'with data:', data);
    
    try {
      const updatePayload = {
        stock_number: data.stockNumber,
        shape: data.shape,
        carat: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: data.price,
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || '',
        status: data.status || 'available',
        store_visible: data.storeVisible ?? true,
      };

      console.log('📤 CRUD: Sending update payload to FastAPI:', updatePayload);
      
      const response = await api.put(`/diamonds/${diamondId}`, updatePayload);
      
      if (response.error) {
        console.error('❌ CRUD: FastAPI error when updating diamond:', response.error);
        toast.error(`Failed to update diamond: ${response.error}`);
        onError?.(response.error);
        return false;
      }
      
      console.log('✅ CRUD: Diamond updated successfully:', response.data);
      toast.success('Diamond updated successfully!');
      onSuccess?.();
      return true;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ CRUD: Exception when updating diamond:', error);
      toast.error(`Failed to update diamond: ${errorMsg}`);
      onError?.(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const deleteDiamond = useCallback(async (diamondId: string, diamond?: Diamond): Promise<boolean> => {
    setIsLoading(true);
    const stockNumber = diamond?.stockNumber || diamondId;
    console.log('🔄 CRUD: Deleting diamond ID:', diamondId, 'Stock:', stockNumber);
    
    try {
      // Use the actual diamond ID from FastAPI for deletion
      const deleteId = diamond?.diamondId?.toString() || diamondId;
      console.log('🗑️ CRUD: Using delete ID:', deleteId);
      
      const response = await api.delete(`/diamonds/${deleteId}`);
      
      if (response.error) {
        console.error('❌ CRUD: FastAPI error when deleting diamond:', response.error);
        toast.error(`Failed to delete diamond: ${response.error}`);
        onError?.(response.error);
        return false;
      }
      
      console.log('✅ CRUD: Diamond deleted successfully from FastAPI');
      toast.success(`Diamond ${stockNumber} deleted successfully!`);
      onSuccess?.();
      return true;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ CRUD: Exception when deleting diamond:', error);
      toast.error(`Failed to delete diamond: ${errorMsg}`);
      onError?.(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  return {
    addDiamond,
    updateDiamond,
    deleteDiamond,
    isLoading,
  };
}
