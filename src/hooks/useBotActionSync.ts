/**
 * Real-time bot action synchronization hook
 * Listens for bot actions (upload confirmations, auction bids, etc.) 
 * and syncs them with the mini app state
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';
import { diamondKeys } from '@/hooks/api/useDiamonds';
import { auctionKeys } from '@/hooks/api/useAuctions';

export function useBotActionSync() {
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) {
      console.log('🔴 Bot sync: No user, skipping subscription');
      return;
    }

    console.log('🔴 Setting up bot action sync for user:', user.id);

    // Subscribe to user-specific bot actions
    const channel = supabase.channel(`user_${user.id}_actions`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bot_action_callbacks',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        console.log('🔔 Bot action received:', payload);
        
        const action = payload.new as any;
        
        // Handle different action types
        switch(action.action_type) {
          case 'diamond_uploaded':
            console.log('💎 Diamond uploaded via bot');
            
            // Refresh diamond list
            await queryClient.invalidateQueries({ queryKey: diamondKeys.list(user.id) });
            
            // Show success toast
            toast({
              title: '✅ יהלום הועלה בהצלחה!',
              description: action.action_data?.stock_number 
                ? `יהלום ${action.action_data.stock_number} נוסף למלאי שלך`
                : 'היהלום נוסף למלאי שלך',
              duration: 5000,
            });
            
            // Haptic feedback
            try {
              const tg = window.Telegram?.WebApp as any;
              tg?.HapticFeedback?.notificationOccurred('success');
            } catch (e) {}
            break;
            
          case 'auction_bid':
            console.log('🔨 New bid on auction');
            
            // Refresh auction list
            await queryClient.invalidateQueries({ queryKey: auctionKeys.list(user.id) });
            
            // Show notification
            toast({
              title: '💰 הצעה חדשה!',
              description: action.action_data?.bid_amount 
                ? `הצעה חדשה: $${action.action_data.bid_amount}`
                : 'התקבלה הצעה חדשה על המכרז שלך',
              duration: 4000,
            });
            
            // Haptic feedback
            try {
              const tg = window.Telegram?.WebApp as any;
              tg?.HapticFeedback?.notificationOccurred('warning');
            } catch (e) {}
            break;
            
          case 'share_clicked':
            console.log('🔗 Diamond share clicked');
            
            // Refresh analytics
            await queryClient.invalidateQueries({ queryKey: ['analytics'] });
            
            // Silent update - don't notify for shares
            break;
            
          case 'offer_received':
            console.log('💌 New offer received');
            
            toast({
              title: '💌 הצעה חדשה!',
              description: 'קיבלת הצעה חדשה על אחד היהלומים שלך',
              duration: 5000,
            });
            
            // Haptic feedback
            try {
              const tg = window.Telegram?.WebApp as any;
              tg?.HapticFeedback?.impactOccurred('medium');
            } catch (e) {}
            break;
            
          default:
            console.log('ℹ️ Unknown bot action type:', action.action_type);
        }
      })
      .subscribe((status) => {
        console.log('🔴 Bot action subscription status:', status);
      });

    return () => {
      console.log('🔴 Cleaning up bot action subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, toast]);
}
