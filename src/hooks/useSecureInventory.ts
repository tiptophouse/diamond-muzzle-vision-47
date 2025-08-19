
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/api/secureClient';
import { getCurrentJWTUserId, isJWTValid } from '@/lib/api/jwtAuth';
import { toast } from "@/components/ui/use-toast";

interface Diamond {
  id: number;
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  price_per_carat?: number;
  picture?: string;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

interface UseSecureInventoryReturn {
  diamonds: Diamond[];
  loading: boolean;
  error: string | null;
  fetchDiamonds: () => Promise<void>;
  addDiamond: (diamond: Partial<Diamond>) => Promise<boolean>;
  updateDiamond: (diamondId: number, updates: Partial<Diamond>) => Promise<boolean>;
  deleteDiamond: (diamondId: number) => Promise<boolean>;
  totalCount: number;
}

export function useSecureInventory(): UseSecureInventoryReturn {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiamonds = useCallback(async () => {
    if (!isJWTValid()) {
      setError('Authentication required');
      return;
    }

    const userId = getCurrentJWTUserId();
    console.log('📊 Fetching diamonds for user:', userId);
    
    setLoading(true);
    setError(null);

    try {
      const response = await secureApi.get<Diamond[]>('/api/v1/get_all_stones');
      
      if (response.error) {
        setError(response.error);
        console.error('❌ Failed to fetch diamonds:', response.error);
      } else if (response.data) {
        setDiamonds(response.data);
        console.log('✅ Fetched', response.data.length, 'diamonds for user', userId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch diamonds';
      setError(errorMessage);
      console.error('❌ Fetch diamonds error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDiamond = useCallback(async (diamond: Partial<Diamond>): Promise<boolean> => {
    if (!isJWTValid()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add diamonds",
        variant: "destructive",
      });
      return false;
    }

    const userId = getCurrentJWTUserId();
    console.log('➕ Adding diamond for user:', userId, diamond);

    try {
      const response = await secureApi.post('/api/v1/diamonds', diamond);
      
      if (response.error) {
        console.error('❌ Failed to add diamond:', response.error);
        toast({
          title: "Failed to Add Diamond",
          description: response.error,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Diamond added successfully');
      toast({
        title: "Diamond Added",
        description: "Your diamond has been added successfully",
      });
      
      // Refresh the list
      await fetchDiamonds();
      return true;
    } catch (error) {
      console.error('❌ Add diamond error:', error);
      toast({
        title: "Error Adding Diamond",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchDiamonds]);

  const updateDiamond = useCallback(async (diamondId: number, updates: Partial<Diamond>): Promise<boolean> => {
    if (!isJWTValid()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update diamonds",
        variant: "destructive",
      });
      return false;
    }

    const userId = getCurrentJWTUserId();
    console.log('✏️ Updating diamond:', diamondId, 'for user:', userId, updates);

    try {
      const response = await secureApi.put(`/api/v1/diamonds/${diamondId}`, updates);
      
      if (response.error) {
        console.error('❌ Failed to update diamond:', response.error);
        toast({
          title: "Failed to Update Diamond",
          description: response.error,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Diamond updated successfully');
      toast({
        title: "Diamond Updated",
        description: "Your diamond has been updated successfully",
      });
      
      // Refresh the list
      await fetchDiamonds();
      return true;
    } catch (error) {
      console.error('❌ Update diamond error:', error);
      toast({
        title: "Error Updating Diamond",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchDiamonds]);

  const deleteDiamond = useCallback(async (diamondId: number): Promise<boolean> => {
    if (!isJWTValid()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete diamonds",
        variant: "destructive",
      });
      return false;
    }

    const userId = getCurrentJWTUserId();
    console.log('🗑️ Deleting diamond:', diamondId, 'for user:', userId);

    try {
      const response = await secureApi.delete(`/api/v1/delete_stone/${diamondId}`);
      
      if (response.error) {
        console.error('❌ Failed to delete diamond:', response.error);
        toast({
          title: "Failed to Delete Diamond",
          description: response.error,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Diamond deleted successfully');
      toast({
        title: "Diamond Deleted",
        description: "Your diamond has been deleted successfully",
      });
      
      // Remove from local state immediately
      setDiamonds(prev => prev.filter(d => d.id !== diamondId));
      return true;
    } catch (error) {
      console.error('❌ Delete diamond error:', error);
      toast({
        title: "Error Deleting Diamond",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (isJWTValid()) {
      fetchDiamonds();
    }
  }, [fetchDiamonds]);

  return {
    diamonds,
    loading,
    error,
    fetchDiamonds,
    addDiamond,
    updateDiamond,
    deleteDiamond,
    totalCount: diamonds.length,
  };
}
