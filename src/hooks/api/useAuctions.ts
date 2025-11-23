/**
 * React Query hooks for auction management
 * Handles auction creation with real-time updates and feedback
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import type { AuctionCreateRequest, AuctionSchema } from '@/types/fastapi-models';

// Query keys
export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (userId: number) => [...auctionKeys.lists(), userId] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (id: string) => [...auctionKeys.details(), id] as const,
};

/**
 * Create auction with comprehensive feedback and Telegram message broadcasting
 */
export function useCreateAuction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  return useMutation({
    mutationFn: async (auctionData: AuctionCreateRequest) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🔨 Creating auction:', auctionData.stock_number);
      
      // Show loading toast
      toast({
        title: '⏳ יוצר מכרז...',
        description: 'מכין את הודעת המכרז לקבוצת הטלגרם',
      });

      // Calculate end time
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + auctionData.duration_hours);

      // Step 1: Set user context for RLS
      const { error: contextError } = await supabase.rpc('set_user_context', {
        telegram_id: user.id
      });

      if (contextError) {
        console.error('❌ Failed to set user context:', contextError);
        throw new Error(`Authentication context failed: ${contextError.message}`);
      }

      // Step 2: Get diamond details for snapshot
      const { data: diamond, error: fetchError } = await supabase
        .from('inventory' as any)
        .select('*')
        .eq('stock_number', auctionData.stock_number)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (fetchError || !diamond) {
        console.error('❌ Diamond not found:', fetchError);
        throw new Error('Diamond not found in your inventory');
      }

      // Step 3: Create auction record
      const { data: auction, error: auctionError } = await (supabase as any)
        .from('auctions')
        .insert([{
          stock_number: auctionData.stock_number,
          starting_price: auctionData.starting_price,
          current_price: auctionData.starting_price,
          min_increment: auctionData.min_increment,
          currency: auctionData.currency || 'USD',
          ends_at: endsAt.toISOString(),
          seller_telegram_id: user.id,
        }])
        .select()
        .single();

      if (auctionError) {
        console.error('❌ Failed to create auction:', auctionError);
        throw new Error(`Auction creation failed: ${auctionError.message}`);
      }

      // Step 4: Store diamond snapshot
      const diamondRecord = diamond as any;
      const { error: diamondError } = await supabase
        .from('auction_diamonds' as any)
        .insert({
          auction_id: auction.id,
          stock_number: diamondRecord.stock_number,
          shape: diamondRecord.shape,
          weight: diamondRecord.weight,
          color: diamondRecord.color,
          clarity: diamondRecord.clarity,
          cut: diamondRecord.cut,
          polish: diamondRecord.polish,
          symmetry: diamondRecord.symmetry,
          fluorescence: diamondRecord.fluorescence,
          measurements: diamondRecord.measurements,
          table_percentage: diamondRecord.table_percentage,
          depth_percentage: diamondRecord.depth_percentage,
          certificate_number: diamondRecord.certificate_number,
          lab: diamondRecord.lab,
          picture: diamondRecord.picture,
          certificate_url: diamondRecord.certificate_url,
          video_url: diamondRecord.video_url,
          price_per_carat: diamondRecord.price_per_carat,
          total_price: diamondRecord.price_per_carat * diamondRecord.weight,
        });

      if (diamondError) {
        console.warn('⚠️ Failed to store diamond snapshot:', diamondError);
      }

      // Step 5: Send auction message to Telegram group
      const { data: messageData, error: messageError } = await supabase.functions.invoke('send-auction-message', {
        body: {
          auction_id: auction.id,
          stock_number: auction.stock_number,
          current_price: auction.starting_price,
          min_increment: auction.min_increment,
          currency: auction.currency,
          ends_at: auction.ends_at
        }
      });

      if (messageError) {
        console.error('❌ Failed to send auction message:', messageError);
        // Don't throw - auction was created, just notify failed
        return {
          auction: auction as AuctionSchema,
          messageId: null,
          messageSent: false,
          error: messageError.message
        };
      }

      return {
        auction: auction as AuctionSchema,
        messageId: messageData?.message_id,
        messageSent: true,
        error: null
      };
    },
    onSuccess: (data) => {
      console.log('✅ Auction created successfully:', data.auction.id);
      
      // Haptic success feedback
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      // Invalidate auction queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: auctionKeys.list(user.id) });
      }
      
      // Show comprehensive success message
      if (data.messageSent && data.messageId) {
        toast({
          title: '✅ מכרז נוצר בהצלחה!',
          description: `המכרז נשלח לקבוצת הטלגרם (Message ID: ${data.messageId})`,
          duration: 5000,
        });
      } else if (data.error) {
        toast({
          title: '⚠️ מכרז נוצר, אך לא נשלח',
          description: `המכרז נוצר במערכת אך לא נשלח לטלגרם: ${data.error}`,
          variant: 'destructive',
          duration: 7000,
        });
      }
    },
    onError: (error: Error) => {
      console.error('❌ Auction creation failed:', error);
      
      // Haptic error feedback
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
      
      toast({
        title: '❌ שגיאה ביצירת מכרז',
        description: error.message || 'אנא נסה שוב',
        variant: 'destructive',
        duration: 7000,
      });
    },
  });
}

/**
 * Get all auctions for the authenticated user
 */
export function useMyAuctions() {
  const { user } = useTelegramAuth();
  
  return useQuery({
    queryKey: auctionKeys.list(user?.id || 0),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auctions' as any)
        .select('*, auction_diamonds(*), auction_bids(count)')
        .eq('seller_telegram_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

/**
 * Get auction by ID with full details
 */
export function useAuction(auctionId: string | null) {
  return useQuery({
    queryKey: auctionKeys.detail(auctionId || ''),
    queryFn: async () => {
      if (!auctionId) return null;

      // Get auction with diamond snapshot
      const { data: auction, error } = await supabase
        .from('auctions' as any)
        .select('*')
        .eq('id', auctionId)
        .single();

      if (error) throw error;

      // Get diamond snapshot
      const { data: diamond } = await supabase
        .from('auction_diamonds' as any)
        .select('*')
        .eq('auction_id', auctionId)
        .single();

      // Get bids
      const { data: bids } = await supabase
        .from('auction_bids' as any)
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!auction) return null;

      return {
        ...(auction as any),
        diamond: diamond || null,
        bids: bids || [],
        bid_count: bids?.length || 0,
      } as AuctionSchema;
    },
    enabled: !!auctionId,
  });
}
