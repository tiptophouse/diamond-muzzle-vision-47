import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export interface WishlistItem {
  id: string;
  diamond_stock_number: string;
  visitor_telegram_id: number;
  diamond_owner_telegram_id: number;
  diamond_data: any;
  created_at: string;
  updated_at: string;
}

export interface WishlistCriteria {
  shape?: string;
  color?: string;
  clarity?: string;
  weight_min?: number;
  weight_max?: number;
  price_min?: number;
  price_max?: number;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
}

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  // Fetch user's wishlist items
  const fetchWishlist = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('visitor_telegram_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
        toast({
          title: "שגיאה בטעינת רשימת המשאלות",
          description: "לא הצלחנו לטעון את רשימת המשאלות שלך.",
          variant: "destructive"
        });
        return;
      }

      setWishlistItems((data || []) as WishlistItem[]);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (criteria: WishlistCriteria, title?: string) => {
    if (!user?.id) {
      toast({
        title: "נדרש להתחבר",
        description: "יש להתחבר כדי להוסיף פריטים לרשימת המשאלות.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const wishlistData = {
        visitor_telegram_id: user.id,
        diamond_owner_telegram_id: 0, // Will be set when matching
        diamond_stock_number: title || `wish_${Date.now()}`,
        diamond_data: criteria
      };

      const { error } = await supabase
        .from('wishlist')
        .insert([wishlistData as any]);

      if (error) {
        console.error('Error adding to wishlist:', error);
        toast({
          title: "שגיאה בהוספה לרשימת המשאלות",
          description: "לא הצלחנו להוסיף את הפריט לרשימת המשאלות.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "נוסף לרשימת המשאלות ✨",
        description: "הפריט נוסף בהצלחה. תקבל התראה כשנמצא יהלום מתאים!",
      });

      await fetchWishlist(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId)
        .eq('visitor_telegram_id', user?.id);

      if (error) {
        console.error('Error removing from wishlist:', error);
        toast({
          title: "שגיאה בהסרה מרשימת המשאלות",
          description: "לא הצלחנו להסיר את הפריט מרשימת המשאלות.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "הוסר מרשימת המשאלות",
        description: "הפריט הוסר בהצלחה מרשימת המשאלות שלך.",
      });

      await fetchWishlist(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  // Check for wishlist matches when diamonds are uploaded
  const checkWishlistMatches = async (uploadedDiamonds: any[]) => {
    if (!uploadedDiamonds.length) return;

    try {
      // Invoke the wishlist matching edge function
      const { data, error } = await supabase.functions.invoke('wishlist-matcher', {
        body: {
          diamonds: uploadedDiamonds,
          uploaderTelegramId: user?.id
        }
      });

      if (error) {
        console.error('Error checking wishlist matches:', error);
        return;
      }

      if (data?.matches > 0) {
        toast({
          title: `🎯 נמצאו ${data.matches} התאמות!`,
          description: "יהלומים שהעלית מתאימים לרשימות משאלות של לקוחות. הם קיבלו התראה!",
        });
      }

      return data;
    } catch (error) {
      console.error('Error checking wishlist matches:', error);
    }
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
    checkWishlistMatches,
    refetchWishlist: fetchWishlist
  };
}