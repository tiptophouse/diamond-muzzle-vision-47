
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';

export function useWishlist() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();

  const addToWishlist = useCallback(async (diamond: Diamond, ownerTelegramId: number) => {
    if (!user?.id) {
      toast({
        title: "❌ Authentication Required",
        description: "Please log in to add items to wishlist",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
      return false;
    }

    setIsLoading(true);
    try {
      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlist')
        .select('id')
        .eq('visitor_telegram_id', user.id)
        .eq('diamond_stock_number', diamond.stockNumber)
        .single();

      if (existing) {
        toast({
          title: "💎 Already in Wishlist",
          description: "This diamond is already in your wishlist",
        });
        hapticFeedback.notification('warning');
        return false;
      }

      const { error } = await supabase.from('wishlist').insert({
        visitor_telegram_id: user.id,
        diamond_owner_telegram_id: ownerTelegramId,
        diamond_stock_number: diamond.stockNumber,
        diamond_data: {
          stockNumber: diamond.stockNumber,
          shape: diamond.shape,
          carat: diamond.carat,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut,
          price: diamond.price,
          price_per_carat: diamond.price / diamond.carat,
          imageUrl: diamond.imageUrl,
          certificateUrl: diamond.certificateUrl,
          gem360Url: diamond.gem360Url,
          lab: diamond.lab,
        },
      });

      if (error) throw error;

      toast({
        title: "❤️ Added to Wishlist",
        description: `${diamond.carat}ct ${diamond.shape} diamond added successfully`,
      });
      hapticFeedback.notification('success');
      return true;
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      toast({
        title: "❌ Failed to Add",
        description: "Could not add diamond to wishlist. Please try again.",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast, hapticFeedback]);

  const removeFromWishlist = useCallback(async (stockNumber: string) => {
    if (!user?.id) {
      hapticFeedback.notification('error');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('visitor_telegram_id', user.id)
        .eq('diamond_stock_number', stockNumber);

      if (error) throw error;

      toast({
        title: "✅ Removed from Wishlist",
        description: "Diamond successfully removed",
      });
      hapticFeedback.notification('success');
      return true;
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      toast({
        title: "❌ Removal Failed",
        description: "Could not remove diamond from wishlist",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast, hapticFeedback]);

  const checkIsInWishlist = useCallback(async (stockNumber: string) => {
    if (!user?.id) return false;

    try {
      const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('visitor_telegram_id', user.id)
        .eq('diamond_stock_number', stockNumber)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }, [user?.id]);

  return {
    addToWishlist,
    removeFromWishlist,
    checkIsInWishlist,
    isLoading,
  };
}
