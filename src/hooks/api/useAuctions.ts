import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAuctions, getAuction, createAuction, placeBid, closeAuction } from "@/api/auctions";
import { toast } from "sonner";
import { getTelegramWebApp } from "@/utils/telegramWebApp";
import type { FastAPIAuctionCreateRequest, FastAPIBidRequest } from "@/types/fastapi-models";

const haptic = (type: 'success' | 'error' | 'light') => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
    else if (type === 'error') tg.HapticFeedback.notificationOccurred('error');
    else tg.HapticFeedback.impactOccurred('light');
  }
};

export function useAuctions() {
  return useQuery({
    queryKey: ['auctions'],
    queryFn: listAuctions,
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useAuction(auctionId: number) {
  return useQuery({
    queryKey: ['auction', auctionId],
    queryFn: () => getAuction(auctionId),
    enabled: !!auctionId,
    refetchInterval: 5000, // Refresh every 5s for live updates
  });
}

export function useCreateAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FastAPIAuctionCreateRequest) => createAuction(data),
    onSuccess: () => {
      haptic('success');
      toast.success("✅ מכרז נוצר בהצלחה!");
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: () => {
      haptic('error');
      toast.error("לא ניתן ליצור מכרז כרגע");
    }
  });
}

export function usePlaceBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ auctionId, data }: { auctionId: number; data: FastAPIBidRequest }) => 
      placeBid(auctionId, data),
    onSuccess: (_, variables) => {
      haptic('success');
      toast.success("✅ ההצעה נרשמה בהצלחה!");
      queryClient.invalidateQueries({ queryKey: ['auction', variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: () => {
      haptic('error');
      toast.error("לא ניתן להציע כרגע");
    }
  });
}

export function useCloseAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auctionId: number) => closeAuction(auctionId),
    onSuccess: () => {
      haptic('success');
      toast.success("✅ המכרז נסגר בהצלחה");
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: () => {
      haptic('error');
      toast.error("שגיאה בסגירת המכרז");
    }
  });
}
