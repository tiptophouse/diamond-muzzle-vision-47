import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/types/diamond';

export function useWishlist() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const addToWishlist = async (diamond: Diamond, ownerTelegramId: number) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to wishlist",
        variant: "destructive",
      });
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
          title: "Already in Wishlist",
          description: "This diamond is already in your wishlist",
        });
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
          price_per_carat: diamond.price / diamond.carat,
          imageUrl: diamond.imageUrl,
          certificateUrl: diamond.certificateUrl,
          lab: diamond.lab,
        },
      });

      if (error) throw error;

      toast({
        title: "❤️ Added to Wishlist",
        description: "Diamond has been added to your wishlist",
      });
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "❌ Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (stockNumber: string) => {
    if (!user?.id) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('visitor_telegram_id', user.id)
        .eq('diamond_stock_number', stockNumber);

      if (error) throw error;

      toast({
        title: "✅ Removed",
        description: "Diamond removed from wishlist",
      });
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "❌ Error",
        description: "Failed to remove from wishlist",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkIsInWishlist = async (stockNumber: string) => {
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
  };

  const isInWishlist = async (stockNumber: string) => {
    return await checkIsInWishlist(stockNumber);
  };

  return {
    addToWishlist,
    removeFromWishlist,
    checkIsInWishlist,
    isInWishlist,
    isLoading,
  };
}
