
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';

export function useWishlistNotifications() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    // Listen for new inventory additions that might match wishlist items
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inventory'
        },
        async (payload) => {
          console.log('New diamond uploaded:', payload);
          await checkWishlistMatches(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const checkWishlistMatches = async (newDiamond: any) => {
    try {
      // Get all wishlist items to check for matches
      const { data: wishlistItems, error } = await supabase
        .from('wishlist')
        .select('*')
        .neq('visitor_telegram_id', newDiamond.user_id); // Don't notify the uploader

      if (error) {
        console.error('Error fetching wishlist items:', error);
        return;
      }

      // Check each wishlist item for matches
      for (const item of wishlistItems || []) {
        const diamond = item.diamond_data;
        const isMatch = checkDiamondMatch(newDiamond, diamond);

        if (isMatch) {
          // Send notification to the wishlist owner
          await sendWishlistNotification(item, newDiamond);
        }
      }
    } catch (error) {
      console.error('Error checking wishlist matches:', error);
    }
  };

  const checkDiamondMatch = (uploaded: any, wishlist: any) => {
    // Basic matching logic - can be enhanced
    const shapeMatch = !wishlist.shape || uploaded.shape === wishlist.shape;
    const colorMatch = !wishlist.color || uploaded.color === wishlist.color;
    const clarityMatch = !wishlist.clarity || uploaded.clarity === wishlist.clarity;
    const cutMatch = !wishlist.cut || uploaded.cut === wishlist.cut;
    
    // Carat range matching (if specified)
    let caratMatch = true;
    if (wishlist.caratMin && uploaded.weight < parseFloat(wishlist.caratMin)) {
      caratMatch = false;
    }
    if (wishlist.caratMax && uploaded.weight > parseFloat(wishlist.caratMax)) {
      caratMatch = false;
    }

    // Price range matching (if specified)
    let priceMatch = true;
    const uploadedPrice = uploaded.price_per_carat * uploaded.weight;
    if (wishlist.priceMin && uploadedPrice < parseFloat(wishlist.priceMin)) {
      priceMatch = false;
    }
    if (wishlist.priceMax && uploadedPrice > parseFloat(wishlist.priceMax)) {
      priceMatch = false;
    }

    return shapeMatch && colorMatch && clarityMatch && cutMatch && caratMatch && priceMatch;
  };

  const sendWishlistNotification = async (wishlistItem: any, matchedDiamond: any) => {
    try {
      // Get uploader information
      const { data: uploaderProfile } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, username')
        .eq('telegram_id', matchedDiamond.user_id)
        .single();

      if (!uploaderProfile) return;

      // Send notification via Telegram bot
      const { error } = await supabase.functions.invoke('send-wishlist-notification', {
        body: {
          wishlistOwnerTelegramId: wishlistItem.visitor_telegram_id,
          uploaderInfo: {
            telegramId: uploaderProfile.telegram_id,
            firstName: uploaderProfile.first_name,
            username: uploaderProfile.username
          },
          matchedDiamond: {
            stockNumber: matchedDiamond.stock_number,
            shape: matchedDiamond.shape,
            carat: matchedDiamond.weight,
            color: matchedDiamond.color,
            clarity: matchedDiamond.clarity,
            cut: matchedDiamond.cut,
            price: matchedDiamond.price_per_carat * matchedDiamond.weight,
            imageUrl: matchedDiamond.picture
          }
        }
      });

      if (error) {
        console.error('Error sending wishlist notification:', error);
      } else {
        console.log('✅ Wishlist notification sent successfully');
      }
    } catch (error) {
      console.error('Error in sendWishlistNotification:', error);
    }
  };

  return {
    checkWishlistMatches
  };
}
