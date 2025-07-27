
import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Trash2, Eye, Share2, MessageCircle, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';

interface DiamondData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  price_per_carat: number;
  imageUrl?: string;
  certificateUrl?: string;
  gem360Url?: string;
  lab?: string;
}

interface WishlistItem {
  id: string;
  diamond_stock_number: string;
  diamond_data: DiamondData;
  diamond_owner_telegram_id: number;
  created_at: string;
}

export function WishlistContent() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { hapticFeedback, share } = useTelegramWebApp();

  const fetchWishlist = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('visitor_telegram_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the Json type to our expected structure
      const typedData: WishlistItem[] = (data || []).map(item => ({
        ...item,
        diamond_data: item.diamond_data as DiamondData
      }));
      
      setWishlistItems(typedData);
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (itemId: string, stockNumber: string) => {
    if (!user?.id) return;

    setRemoving(itemId);
    hapticFeedback.impact('medium');

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId)
        .eq('visitor_telegram_id', user.id);

      if (error) throw error;

      // Optimistically update UI
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "✅ Removed Successfully",
        description: "Diamond removed from your wishlist",
      });
      hapticFeedback.notification('success');
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      toast({
        title: "❌ Removal Failed", 
        description: "Could not remove diamond from wishlist",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
    } finally {
      setRemoving(null);
    }
  };

  const shareDiamond = async (diamond: DiamondData) => {
    hapticFeedback.selection();
    
    const shareText = `💎 ${diamond.carat}ct ${diamond.shape} Diamond
    
📊 Details:
• Color: ${diamond.color}
• Clarity: ${diamond.clarity} 
• Cut: ${diamond.cut}
• Lab: ${diamond.lab || 'N/A'}

💰 Price: $${diamond.price.toLocaleString()}
📈 Per Carat: $${diamond.price_per_carat.toLocaleString()}

🔗 Stock #${diamond.stockNumber}`;

    await share(shareText);
  };

  const contactOwner = (ownerTelegramId: number, diamond: DiamondData) => {
    hapticFeedback.impact('light');
    
    const message = `Hi! I'm interested in your ${diamond.carat}ct ${diamond.shape} diamond (Stock #${diamond.stockNumber}). Could you provide more details?`;
    
    // Use Telegram's native messaging
    window.open(`tg://user?id=${ownerTelegramId}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const viewDiamond = (stockNumber: string) => {
    hapticFeedback.selection();
    // Navigate to store with specific diamond
    window.location.href = `/store?stock=${stockNumber}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">My Wishlist</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-40 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">My Wishlist</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Browse the diamond store and save your favorite diamonds for later
          </p>
          <Button 
            onClick={() => window.location.href = '/store'}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Browse Diamonds
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <Badge variant="secondary" className="ml-2">
            {wishlistItems.length} items
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
        {wishlistItems.map((item) => {
          const diamond = item.diamond_data;
          
          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                {diamond.imageUrl && (
                  <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={diamond.imageUrl} 
                      alt={`${diamond.shape} Diamond`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{diamond.stockNumber}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id, diamond.stockNumber)}
                      disabled={removing === item.id}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">{diamond.shape}</span></div>
                    <div><span className="font-medium">{diamond.carat}ct</span></div>
                    <div>{diamond.color}</div>
                    <div>{diamond.clarity}</div>
                    <div className="text-xs text-gray-500">{diamond.cut}</div>
                    <div className="text-xs text-gray-500">{diamond.lab}</div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-2xl font-bold text-green-600">
                        ${diamond.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${diamond.price_per_carat.toLocaleString()}/ct
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDiamond(diamond.stockNumber)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => contactOwner(item.diamond_owner_telegram_id, diamond)}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareDiamond(diamond)}
                        className="flex items-center gap-1"
                      >
                        <Share2 className="h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 pt-2 border-t">
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
