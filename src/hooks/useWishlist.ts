
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';

interface WishlistItem {
  id: string;
  visitor_telegram_id: number;
  diamond_owner_telegram_id: number;
  diamond_stock_number: string;
  diamond_data: any;
  created_at: string;
  updated_at: string;
}

export function useWishlist() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const addToWishlist = async (diamond: Diamond, ownerTelegramId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add diamonds to your wishlist",
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

      // Add to wishlist
      const { error } = await supabase
        .from('wishlist')
        .insert({
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
            imageUrl: diamond.imageUrl || diamond.picture
          }
        });

      if (error) throw error;

      // Send notification to diamond owner
      const { error: notificationError } = await supabase.functions.invoke('send-wishlist-notification', {
        body: {
          diamondData: {
            stockNumber: diamond.stockNumber,
            shape: diamond.shape,
            carat: diamond.carat,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: diamond.price,
            imageUrl: diamond.imageUrl || diamond.picture
          },
          visitorInfo: {
            telegramId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            phoneNumber: user.phone_number
          },
          ownerTelegramId
        }
      });

      if (notificationError) {
        console.error('Failed to send notification:', notificationError);
      }

      toast({
        title: "Added to Wishlist",
        description: "Diamond added to your wishlist successfully! The owner has been notified.",
      });

      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add diamond to wishlist",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (stockNumber: string) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('visitor_telegram_id', user.id)
        .eq('diamond_stock_number', stockNumber);

      if (error) throw error;

      toast({
        title: "Removed from Wishlist",
        description: "Diamond removed from your wishlist",
      });

      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove diamond from wishlist",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getWishlist = async (): Promise<WishlistItem[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('visitor_telegram_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  };

  const isInWishlist = async (stockNumber: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('visitor_telegram_id', user.id)
        .eq('diamond_stock_number', stockNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  };

  return {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    isInWishlist,
    isLoading
  };
}
