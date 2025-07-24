
import { useState, useEffect } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Trash2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  visitor_telegram_id: number;
  diamond_owner_telegram_id: number;
  diamond_stock_number: string;
  diamond_data: {
    stockNumber: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    price: number;
    imageUrl?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { removeFromWishlist, getWishlist } = useWishlist();
  const { user } = useTelegramAuth();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const items = await getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (stockNumber: string) => {
    impactOccurred('medium');
    const success = await removeFromWishlist(stockNumber);
    if (success) {
      setWishlistItems(items => items.filter(item => item.diamond_stock_number !== stockNumber));
      notificationOccurred('success');
    }
  };

  const handleContactOwner = async (item: WishlistItem) => {
    impactOccurred('light');
    
    if (!user) {
      toast.error('Please sign in to contact the owner');
      return;
    }

    try {
      // Call the existing contact function
      const { error } = await supabase.functions.invoke('send-diamond-contact', {
        body: {
          diamondData: {
            stockNumber: item.diamond_data.stockNumber,
            shape: item.diamond_data.shape,
            carat: item.diamond_data.carat,
            color: item.diamond_data.color,
            clarity: item.diamond_data.clarity,
            cut: item.diamond_data.cut,
            price: item.diamond_data.price,
            imageUrl: item.diamond_data.imageUrl
          },
          visitorInfo: {
            telegramId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username
          },
          ownerTelegramId: item.diamond_owner_telegram_id
        }
      });

      if (error) throw error;

      toast.success('Contact message sent to the diamond owner!');
      notificationOccurred('success');
    } catch (error) {
      console.error('Error contacting owner:', error);
      toast.error('Failed to send contact message');
      notificationOccurred('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">My Wishlist</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">My Wishlist</h1>
          </div>
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">Browse the store and add diamonds to your wishlist</p>
            <Button onClick={() => window.location.href = '/store'} className="bg-primary hover:bg-primary/90">
              Browse Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <Badge variant="secondary" className="ml-2">
              {wishlistItems.length} items
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                  {item.diamond_data.imageUrl ? (
                    <img
                      src={item.diamond_data.imageUrl}
                      alt={`${item.diamond_data.shape} Diamond`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                          <Package className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{item.diamond_data.shape}</p>
                        <p className="text-xs text-gray-500">Diamond</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.diamond_stock_number)}
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {item.diamond_data.carat}ct {item.diamond_data.shape}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.diamond_data.color} • {item.diamond_data.clarity} • {item.diamond_data.cut}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ${item.diamond_data.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${Math.round(item.diamond_data.price / item.diamond_data.carat).toLocaleString()}/ct
                      </p>
                    </div>
                  </div>

                  {/* Stock Number */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Stock: {item.diamond_data.stockNumber}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleContactOwner(item)}
                      className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact Owner
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(item.diamond_stock_number)}
                      className="h-9 px-3 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
