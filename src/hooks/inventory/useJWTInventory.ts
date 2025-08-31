
import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from '@/components/ui/use-toast';

interface Stone {
  id: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut?: string;
  price?: number;
  certificate?: string;
  stock_id?: string;
  [key: string]: any;
}

export function useJWTInventory() {
  const { user, isAuthenticated, accessToken } = useTelegramAuth();
  const [stones, setStones] = useState<Stone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStones = async () => {
    if (!isAuthenticated || !user || !accessToken) {
      console.log('⚠️ Not authenticated - skipping stone fetch');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching stones with JWT authentication...');
      
      const response = await authService.authenticatedFetch(
        `/api/v1/get_all_stones?user_id=${user.id}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stones: ${response.status}`);
      }

      const data = await response.json();
      const stonesList = Array.isArray(data) ? data : data.stones || [];
      
      console.log('✅ Stones fetched successfully:', stonesList.length);
      setStones(stonesList);
      
    } catch (error) {
      console.error('❌ Failed to fetch stones:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stones';
      setError(errorMessage);
      
      toast({
        title: "❌ Fetch Failed",
        description: "Unable to load your stones. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStone = async (stoneData: Partial<Stone>) => {
    if (!isAuthenticated || !user || !accessToken) {
      toast({
        title: "❌ Authentication Required",
        description: "Please authenticate to add stones.",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('➕ Adding stone with JWT authentication...');
      
      const response = await authService.authenticatedFetch(
        `/api/v1/diamonds?user_id=${user.id}`,
        {
          method: 'POST',
          body: JSON.stringify(stoneData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add stone: ${response.status}`);
      }

      const newStone = await response.json();
      console.log('✅ Stone added successfully:', newStone);
      
      // Update local state
      setStones(prev => [...prev, newStone]);
      
      toast({
        title: "✅ Stone Added",
        description: "Your stone has been successfully added to inventory.",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to add stone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add stone';
      
      toast({
        title: "❌ Add Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const deleteStone = async (stoneId: string) => {
    if (!isAuthenticated || !user || !accessToken) {
      toast({
        title: "❌ Authentication Required",
        description: "Please authenticate to delete stones.",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('🗑️ Deleting stone with JWT authentication...');
      
      const response = await authService.authenticatedFetch(
        `/api/v1/delete_stone/${stoneId}?user_id=${user.id}&diamond_id=${stoneId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete stone: ${response.status}`);
      }

      console.log('✅ Stone deleted successfully');
      
      // Update local state
      setStones(prev => prev.filter(stone => stone.id !== stoneId));
      
      toast({
        title: "✅ Stone Deleted",
        description: "Stone has been successfully removed from inventory.",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete stone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete stone';
      
      toast({
        title: "❌ Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Auto-fetch stones when authenticated
  useEffect(() => {
    if (isAuthenticated && user && accessToken) {
      fetchStones();
    }
  }, [isAuthenticated, user, accessToken]);

  return {
    stones,
    isLoading,
    error,
    fetchStones,
    addStone,
    deleteStone,
  };
}
