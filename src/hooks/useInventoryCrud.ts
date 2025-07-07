
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';

export function useInventoryCrud({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { triggerInventoryChange } = useInventoryDataSync();

  const addDiamond = async (data: any): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ No user ID available for diamond creation');
      return false;
    }

    setIsLoading(true);
    console.log('🔍 CRUD: Starting diamond creation with data:', data);

    try {
      // Map form data to FastAPI schema exactly as specified
      const fastApiPayload = {
        stock: data.stockNumber || data.stock || '',
        shape: data.shape === 'Round' ? 'round brilliant' : data.shape?.toLowerCase() || 'round brilliant',
        weight: Number(data.carat) || 1,
        color: data.color || 'D',
        clarity: data.clarity || 'FL',
        lab: data.lab || 'GIA',
        certificate_number: parseInt(data.certificateNumber) || 0,
        length: Number(data.length) || 1,
        width: Number(data.width) || 1,
        depth: Number(data.depth) || 1,
        ratio: Number(data.ratio) || 1,
        cut: data.cut?.toUpperCase() || 'EXCELLENT',
        polish: data.polish?.toUpperCase() || 'EXCELLENT',
        symmetry: data.symmetry?.toUpperCase() || 'EXCELLENT',
        fluorescence: data.fluorescence?.toUpperCase() || 'NONE',
        table: Number(data.tablePercentage) || 1,
        depth_percentage: Number(data.depthPercentage) || 1,
        gridle: data.gridle || '',
        culet: data.culet?.toUpperCase() || 'NONE',
        certificate_comment: data.certificateComment || '',
        rapnet: Number(data.rapnet) || 0,
        price_per_carat: Number(data.pricePerCarat) || (data.price && data.carat ? Math.round(data.price / data.carat) : 0),
        picture: data.picture || ''
      };

      console.log('🔍 CRUD: Mapped payload for FastAPI:', fastApiPayload);

      // Send to FastAPI
      const response = await fetch(`https://api.mazalbot.com/api/v1/diamonds?user_id=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VySWQiLCJleHAiOjE2ODk2MDAwMDAsImlhdCI6MTY4OTU5NjQwMH0.kWzUkeMTF4LZbU9P5yRmsXrXhWfPlUPukGqI8Nq1rLo',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Client-Timestamp': Date.now().toString()
        },
        body: JSON.stringify(fastApiPayload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ FastAPI Error:', response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ CRUD: FastAPI Success:', result);

      toast({
        title: "✅ Success!",
        description: result.message || "Diamond added successfully to your inventory",
      });

      triggerInventoryChange();
      onSuccess?.();
      return true;

    } catch (error) {
      console.error('❌ CRUD: Diamond creation failed:', error);
      
      toast({
        title: "❌ Upload Failed",
        description: error instanceof Error ? error.message : "Failed to add diamond. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiamond = async (stockNumber: string, data: any): Promise<boolean> => {
    // Implementation for update if needed
    return false;
  };

  const deleteDiamond = async (stockNumber: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ No user ID available for diamond deletion');
      return false;
    }

    setIsLoading(true);
    console.log('🔍 CRUD: Deleting diamond:', stockNumber);

    try {
      const response = await fetch(`https://api.mazalbot.com/api/v1/diamonds/${stockNumber}?user_id=${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VySWQiLCJleHAiOjE2ODk2MDAwMDAsImlhdCI6MTY4OTU5NjQwMH0.kWzUkeMTF4LZbU9P5yRmsXrXhWfPlUPukGqI8Nq1rLo',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Delete API Error:', response.status, errorData);
        throw new Error(`Delete failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ CRUD: Delete Success:', result);

      toast({
        title: "✅ Deleted Successfully",
        description: "Diamond removed from your inventory",
      });

      triggerInventoryChange();
      return true;

    } catch (error) {
      console.error('❌ CRUD: Delete failed:', error);
      
      toast({
        title: "❌ Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete diamond. Please try again.",
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
    isLoading
  };
}
