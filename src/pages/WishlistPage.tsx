
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, MessageCircle, Heart, Loader2 } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useTelegramContact } from '@/hooks/useTelegramContact';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { toast } from 'sonner';

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
  const [contactingItem, setContactingItem] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  
  const { getWishlist, removeFromWishlist } = useWishlist();
  const { sendContactMessage, isAvailable } = useTelegramContact();
  const { impactOccurred, notification } = useTelegramHapticFeedback();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const items = await getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (item: WishlistItem) => {
    if (!isAvailable) {
      toast.error('Telegram contact not available');
      return;
    }

    setContactingItem(item.id);
    impactOccurred('light');

    try {
      const diamond = {
        stockNumber: item.diamond_data.stockNumber,
        shape: item.diamond_data.shape,
        carat: item.diamond_data.carat,
        color: item.diamond_data.color,
        clarity: item.diamond_data.clarity,
        cut: item.diamond_data.cut,
        price: item.diamond_data.price,
        imageUrl: item.diamond_data.imageUrl,
        picture: item.diamond_data.imageUrl
      } as any;

      const success = await sendContactMessage(diamond, item.diamond_owner_telegram_id);
      
      if (success) {
        notification('success');
        toast.success('Contact message sent!', {
          description: 'The diamond owner has been notified of your interest.'
        });
      } else {
        notification('error');
        toast.error('Failed to send contact message');
      }
    } catch (error) {
      console.error('Contact error:', error);
      notification('error');
      toast.error('Failed to send contact message');
    } finally {
      setContactingItem(null);
    }
  };

  const handleRemove = async (item: WishlistItem) => {
    setRemovingItem(item.id);
    impactOccurred('medium');

    try {
      const success = await removeFromWishlist(item.diamond_stock_number);
      
      if (success) {
        notification('success');
        setWishlistItems(prev => prev.filter(i => i.id !== item.id));
        toast.success('Removed from wishlist');
      } else {
        notification('error');
        toast.error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Remove error:', error);
      notification('error');
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemovingItem(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-semibold text-foreground">My Wishlist</h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">My Wishlist</h1>
                <p className="text-sm text-muted-foreground">
                  {wishlistItems.length} diamond{wishlistItems.length !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-4">
        {wishlistItems.length === 0 ? (
          <div className="flex items-center justify-center py-20 px-4">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground">
                Start adding diamonds to your wishlist to keep track of your favorites.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 px-4">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      {item.diamond_data.imageUrl ? (
                        <img
                          src={item.diamond_data.imageUrl}
                          alt={`${item.diamond_data.shape} Diamond`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <p className="text-xs text-gray-600 font-medium">
                            {item.diamond_data.shape}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {item.diamond_data.carat}ct {item.diamond_data.shape}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.diamond_data.color} • {item.diamond_data.clarity} • {item.diamond_data.cut}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            ${item.diamond_data.price.toLocaleString()}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {item.diamond_data.stockNumber}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleContact(item)}
                          disabled={contactingItem === item.id || !isAvailable}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {contactingItem === item.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <MessageCircle className="w-4 h-4 mr-1" />
                          )}
                          {contactingItem === item.id ? 'Sending...' : 'Contact'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemove(item)}
                          disabled={removingItem === item.id}
                          className="px-3"
                        >
                          {removingItem === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
