
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getCurrentUserId } from '@/lib/api/config';
import { apiEndpoints } from '@/lib/api/endpoints';
import { toast } from '@/components/ui/use-toast';

export interface Stone {
  id: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  price_per_carat: number;
  total_price?: number;
  status: string;
  picture?: string;
  certificate_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function useStones() {
  const queryClient = useQueryClient();
  const userId = getCurrentUserId();

  // Fetch all stones
  const { data: stones = [], isLoading, error, refetch } = useQuery({
    queryKey: ['stones', userId],
    queryFn: async () => {
      if (!userId) {
        console.warn('⚠️ No user ID available for stones fetch');
        return [];
      }

      console.log('🔍 Fetching stones from FastAPI for user:', userId);
      const result = await api.get<Stone[]>(apiEndpoints.getAllStones(userId));
      
      if (result.error) {
        console.error('❌ Failed to fetch stones:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Stones fetched successfully:', result.data?.length || 0);
      return result.data || [];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  // Delete stone mutation
  const deleteStone = useMutation({
    mutationFn: async (stoneId: string) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('🗑️ Deleting stone:', stoneId, 'for user:', userId);
      const result = await api.delete(apiEndpoints.deleteStone(stoneId, userId));
      
      if (result.error) {
        console.error('❌ Stone deletion failed:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Stone deleted successfully:', stoneId);
      return result.data;
    },
    onSuccess: (data, stoneId) => {
      // Update the cache to remove the deleted stone
      queryClient.setQueryData(['stones', userId], (oldStones: Stone[] = []) => 
        oldStones.filter(stone => stone.id !== stoneId && stone.stock_number !== stoneId)
      );
      
      // Show success message
      toast({
        title: "✅ Stone Deleted Successfully",
        description: "The stone has been removed from your inventory.",
        duration: 4000,
      });

      // Refetch to ensure data consistency
      refetch();
    },
    onError: (error) => {
      console.error('❌ Delete stone error:', error);
      toast({
        title: "❌ Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete the stone. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Add individual stone mutation
  const addStone = useMutation({
    mutationFn: async (stoneData: Omit<Stone, 'id' | 'created_at' | 'updated_at'>) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('➕ Adding new stone for user:', userId);
      const result = await api.post(apiEndpoints.addIndividualStone(), {
        user_id: userId,
        ...stoneData
      });
      
      if (result.error) {
        console.error('❌ Stone addition failed:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Stone added successfully');
      return result.data;
    },
    onSuccess: () => {
      // Refetch stones to get the latest data
      refetch();
      
      // Show success message
      toast({
        title: "✅ Stone Added Successfully",
        description: "The new stone has been added to your inventory.",
        duration: 4000,
      });
    },
    onError: (error) => {
      console.error('❌ Add stone error:', error);
      toast({
        title: "❌ Addition Failed",
        description: error instanceof Error ? error.message : "Failed to add the stone. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  return {
    stones,
    isLoading,
    error,
    refetch,
    deleteStone: deleteStone.mutate,
    isDeletingStone: deleteStone.isPending,
    addStone: addStone.mutate,
    isAddingStone: addStone.isPending,
  };
}
