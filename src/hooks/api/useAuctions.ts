import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createAuction, 
  listAuctions, 
  getAuction, 
  updateAuction,
  placeBid,
  closeAuction,
  CreateAuctionRequest,
  AuctionUpdateRequest,
  PlaceBidRequest,
  Auction
} from '@/lib/api/auctions';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEYS = {
  auctions: ['auctions'] as const,
  auction: (id: number) => ['auctions', id] as const,
};

/**
 * Hook to list all auctions
 */
export function useAuctions() {
  return useQuery({
    queryKey: QUERY_KEYS.auctions,
    queryFn: listAuctions,
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });
}

/**
 * Hook to get a single auction
 */
export function useAuction(auctionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.auction(auctionId),
    queryFn: () => getAuction(auctionId),
    refetchInterval: 3000, // More frequent updates for active auction
    enabled: !!auctionId,
  });
}

/**
 * Hook to create an auction
 */
export function useCreateAuction() {
  const queryClient = useQueryClient();
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CreateAuctionRequest) => createAuction(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auctions });
      hapticFeedback.notification('success');
      toast({
        title: '✅ מכרז נוצר בהצלחה!',
        description: `מכרז #${data.id} נוצר ומחכה לשיתוף`,
      });
    },
    onError: (error: any) => {
      hapticFeedback.notification('error');
      toast({
        title: '❌ שגיאה ביצירת מכרז',
        description: error?.response?.data?.detail || 'לא ניתן ליצור מכרז כרגע',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update an auction
 */
export function useUpdateAuction(auctionId: number) {
  const queryClient = useQueryClient();
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: AuctionUpdateRequest) => updateAuction(auctionId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auction(auctionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auctions });
      hapticFeedback.notification('success');
      toast({
        title: '✅ המכרז עודכן',
        description: 'המכרז עודכן בהצלחה',
      });
    },
    onError: (error: any) => {
      hapticFeedback.notification('error');
      toast({
        title: '❌ שגיאה בעדכון מכרז',
        description: error?.response?.data?.detail || 'לא ניתן לעדכן מכרז כרגע',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to place a bid
 */
export function usePlaceBid(auctionId: number) {
  const queryClient = useQueryClient();
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: PlaceBidRequest) => placeBid(auctionId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auction(auctionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auctions });
      hapticFeedback.notification('success');
      toast({
        title: '✅ ההצעה נשלחה!',
        description: 'ההצעה שלך נרשמה במכרז',
      });
    },
    onError: (error: any) => {
      hapticFeedback.notification('error');
      toast({
        title: '❌ שגיאה בהגשת הצעה',
        description: error?.response?.data?.detail || 'לא ניתן להציע כרגע',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to close an auction
 */
export function useCloseAuction(auctionId: number) {
  const queryClient = useQueryClient();
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => closeAuction(auctionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auction(auctionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auctions });
      hapticFeedback.notification('success');
      toast({
        title: '✅ המכרז נסגר',
        description: 'המכרז סגור וההצעה הזוכה נקבעה',
      });
    },
    onError: (error: any) => {
      hapticFeedback.notification('error');
      toast({
        title: '❌ שגיאה בסגירת מכרז',
        description: error?.response?.data?.detail || 'לא ניתן לסגור מכרז כרגע',
        variant: 'destructive',
      });
    },
  });
}
