
import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Eye, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WishlistItem {
  id: string;
  diamond_stock_number: string;
  diamond_data: any;
  created_at: string;
  diamond_owner_telegram_id: number;
}

export function WishlistContent() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('visitor_telegram_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId)
        .eq('visitor_telegram_id', user?.id);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "✅ Removed",
        description: "Diamond removed from wishlist",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "❌ Error",
        description: "Failed to remove from wishlist",
        variant: "destructive",
      });
    }
  };

  const viewDiamond = (stockNumber: string) => {
    // Navigate to diamond detail page or store
    window.open(`/diamond/${stockNumber}`, '_blank');
  };

  const shareDiamond = (diamondData: any) => {
    if (navigator.share) {
      navigator.share({
        title: `${diamondData.shape} Diamond - ${diamondData.carat}ct`,
        text: `Check out this ${diamondData.carat}ct ${diamondData.color} ${diamondData.clarity} ${diamondData.shape} diamond`,
        url: window.location.origin + `/diamond/${diamondData.stockNumber}`,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.origin + `/diamond/${diamondData.stockNumber}`);
      toast({
        title: "📋 Link Copied",
        description: "Diamond link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">My Wishlist</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">My Wishlist</h1>
        </div>
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Start browsing diamonds and add them to your wishlist</p>
          <Button 
            onClick={() => window.location.href = '/store'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Browse Diamonds
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-red-500" />
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <span className="text-sm text-gray-500">({wishlistItems.length} items)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {wishlistItems.map((item) => {
          const diamond = item.diamond_data;
          const totalPrice = diamond.price_per_carat * diamond.carat;
          
          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {diamond.imageUrl && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img 
                      src={diamond.imageUrl} 
                      alt={`${diamond.shape} Diamond`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm">{diamond.stockNumber}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="font-medium">{diamond.shape}</span>
                    <span className="font-medium">{diamond.carat}ct</span>
                    <span>{diamond.color}</span>
                    <span>{diamond.clarity}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-lg font-bold text-green-600">
                      ${totalPrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${diamond.price_per_carat}/ct
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDiamond(diamond.stockNumber)}
                      className="flex-1 h-8"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareDiamond(diamond)}
                      className="flex-1 h-8"
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-400 pt-1">
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
