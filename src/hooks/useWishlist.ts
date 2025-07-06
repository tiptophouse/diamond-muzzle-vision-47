import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { setCurrentUserId } from '@/lib/api';
import { Diamond } from '@/components/inventory/InventoryTable';

interface WishlistItem {
  id: string;
  visitor_telegram_id: number;
  diamond_owner_telegram_id: number;
  diamond_stock_number: string;
  diamond_data: any;
  created_at: string;
}

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const setUserContext = async () => {
    if (user?.id) {
      setCurrentUserId(user.id);
      
      await supabase.functions.invoke('set-session-context', {
        body: {
          setting_name: 'app.current_user_id',
          setting_value: user.id.toString()
        }
      });
    }
  };

  const fetchWishlist = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      await setUserContext();

      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('visitor_telegram_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (diamond: Diamond, ownerTelegramId: number) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to wishlist",
        variant: "destructive",
      });
      return false;
    }

    try {
      await setUserContext();

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlist')
        .select('id')
        .eq('visitor_telegram_id', user.id)
        .eq('diamond_stock_number', diamond.stockNumber)
        .eq('diamond_owner_telegram_id', ownerTelegramId)
        .single();

      if (existing) {
        toast({
          title: "Already in wishlist",
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
            carat: diamond.carat,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            shape: diamond.shape,
            price: diamond.price,
            imageUrl: diamond.imageUrl,
          }
        });

      if (error) throw error;

      // Send notification to diamond owner
      await supabase.functions.invoke('send-telegram-notification', {
        body: {
          telegram_id: ownerTelegramId,
          message: `🔔 New Wishlist Addition!\n\nSomeone added your ${diamond.carat} carat ${diamond.shape} diamond (${diamond.color}-${diamond.clarity}) to their wishlist!\n\nStock: ${diamond.stockNumber}\nPrice: $${diamond.price.toLocaleString()}`,
          message_type: 'wishlist_addition',
        }
      });

      // Insert notification record
      await supabase
        .from('notifications')
        .insert({
          telegram_id: ownerTelegramId,
          message_type: 'wishlist_addition',
          message_content: `Someone added your ${diamond.carat} carat ${diamond.shape} diamond to their wishlist`,
          metadata: {
            diamond_stock_number: diamond.stockNumber,
            visitor_telegram_id: user.id,
            diamond_details: {
              shape: diamond.shape,
              carat: diamond.carat,
              color: diamond.color,
              clarity: diamond.clarity,
              price: diamond.price
            }
          }
        });

      toast({
        title: "Added to wishlist!",
        description: `${diamond.carat} carat ${diamond.shape} diamond added to your wishlist`,
      });

      fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add diamond to wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromWishlist = async (stockNumber: string, ownerTelegramId: number) => {
    if (!user?.id) return false;

    try {
      await setUserContext();

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('visitor_telegram_id', user.id)
        .eq('diamond_stock_number', stockNumber)
        .eq('diamond_owner_telegram_id', ownerTelegramId);

      if (error) throw error;

      toast({
        title: "Removed from wishlist",
        description: "Diamond removed from your wishlist",
      });

      fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove diamond from wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const isInWishlist = (stockNumber: string, ownerTelegramId: number): boolean => {
    return wishlistItems.some(item => 
      item.diamond_stock_number === stockNumber && 
      item.diamond_owner_telegram_id === ownerTelegramId
    );
  };

  useEffect(() => {
    if (user?.id) {
      fetchWishlist();
    }
  }, [user?.id]);

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  };
}