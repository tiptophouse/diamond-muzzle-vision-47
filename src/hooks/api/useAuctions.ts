import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createAuction, 
  listAuctions, 
  getAuction, 
  updateAuction,
  placeBid,
  closeAuction,
  AuctionUpdateRequest,
  PlaceBidRequest,
  Auction
} from '@/lib/api/auctions';
import { AuctionCreateRequest } from '@/types/fastapi-models';
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
    refetchInterval: 5000,
  });
}

/**
 * Hook to get a single auction
 * @param auctionId - INTEGER auction ID per OpenAPI spec
 */
export function useAuction(auctionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.auction(auctionId),
    queryFn: () => getAuction(auctionId),
    refetchInterval: 3000,
    enabled: !!auctionId && auctionId > 0,
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
    mutationFn: (request: AuctionCreateRequest) => createAuction(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auctions });
      hapticFeedback.notification('success');
      toast({
        title: '✅ מכרז נוצר בהצלחה!',
        description: `מכרז #${data.id} נוצר ומחכה לשיתוף`,
      });
    },
    onError: (error: Error) => {
      hapticFeedback.notification('error');
      toast({
        title: '❌ שגיאה ביצירת מכרז',
        description: error.message || 'לא ניתן ליצור מכרז כרגע',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update an auction
 * @param auctionId - INTEGER auction ID per OpenAPI spec
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
    onError: (error: Error) => {
      hapticFeedback.notification('error');
      toast({
        title: '❌ שגיאה בעדכון מכרז',
        description: error.message || 'לא ניתן לעדכן מכרז כרגע',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to place a bid
 * @param auctionId - INTEGER auction ID per OpenAPI spec
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
    onError: (error: Error) => {
      hapticFeedback.notification('error');
      toast({
        title: '❌ שגיאה בהגשת הצעה',
        description: error.message || 'לא ניתן להציע כרגע',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to close an auction
 * @param auctionId - INTEGER auction ID per OpenAPI spec
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
    onError: (error: Error) => {
      hapticFeedback.notification('error');
      toast({
        title: '❌ שגיאה בסגירת מכרז',
        description: error.message || 'לא ניתן לסגור מכרז כרגע',
        variant: 'destructive',
      });
    },
  });
}
