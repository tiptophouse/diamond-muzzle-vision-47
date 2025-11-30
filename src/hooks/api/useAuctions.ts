import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiEndpoints } from '@/lib/api/endpoints';
import { getAuthHeaders } from '@/lib/api/auth';

interface AuctionCreatePayload {
  diamond_id: number;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  start_price: number;
  min_increment: number;
}

interface BidPayload {
  user_id: number;
  amount: number;
}

interface AuctionUpdatePayload {
  start_time?: string;
  end_time?: string;
  start_price?: number;
  current_price?: number;
  current_winner_id?: number;
  min_increment?: number;
  state?: 'scheduled' | 'active' | 'closed' | 'cancelled';
}

const BASE_URL = import.meta.env.VITE_FASTAPI_URL || 'https://api.mazalbot.com';

export function useCreateAuction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: AuctionCreatePayload) => {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}${apiEndpoints.auctions.create()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create auction');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Auction created successfully');
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create auction');
    },
  });
}

export function useAuctions(params?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['auctions', params],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}${apiEndpoints.auctions.getAll(params)}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }

      return response.json();
    },
  });
}

export function useAuction(auctionId: number) {
  return useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}${apiEndpoints.auctions.getById(String(auctionId))}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch auction');
      }

      return response.json();
    },
    enabled: !!auctionId,
  });
}

export function usePlaceBid(auctionId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: BidPayload) => {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}${apiEndpoints.auctions.placeBid(String(auctionId))}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to place bid');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Bid placed successfully');
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place bid');
    },
  });
}

export function useUpdateAuction(auctionId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: AuctionUpdatePayload) => {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/api/v1/auctions/${auctionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update auction');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Auction updated successfully');
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update auction');
    },
  });
}

export function useCloseAuction(auctionId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/api/v1/auctions/${auctionId}/close`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to close auction');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Auction closed successfully');
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to close auction');
    },
  });
}
