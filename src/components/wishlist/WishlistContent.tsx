
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, ExternalLink, Phone, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { CreateWishlistAlert } from './CreateWishlistAlert';

interface DiamondData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut?: string;
  price?: number;
}

interface WishlistItem {
  id: string;
  diamond_stock_number: string;
  diamond_owner_telegram_id: number;
  diamond_data: DiamondData;
  created_at: string;
}

export function WishlistContent() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateAlert, setShowCreateAlert] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchWishlist();
    }
  }, [user?.id]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      
      await supabase.functions.invoke('set-session-context', {
        body: {
          setting_name: 'app.current_user_id',
          setting_value: user?.id?.toString()
        }
      });

      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('visitor_telegram_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedItems = (data || []).map(item => {
        let diamondData: DiamondData;
        
        // Handle the Json type conversion safely
        if (typeof item.diamond_data === 'object' && item.diamond_data !== null && !Array.isArray(item.diamond_data)) {
          const data = item.diamond_data as { [key: string]: any };
          diamondData = {
            stockNumber: data.stockNumber || '',
            shape: data.shape || '',
            carat: data.carat || 0,
            color: data.color || '',
            clarity: data.clarity || '',
            cut: data.cut || '',
            price: data.price || 0
          };
        } else {
          diamondData = {
            stockNumber: '',
            shape: '',
            carat: 0,
            color: '',
            clarity: '',
            cut: '',
            price: 0
          };
        }

        return {
          ...item,
          diamond_data: diamondData
        };
      }) as WishlistItem[];

      setWishlistItems(processedItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "שגיאה בטעינת רשימת המועדפים",
        description: "לא ניתן לטעון את רשימת המועדפים כרגע",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "✅ הוסר מרשימת המועדפים",
        description: "היהלום הוסר בהצלחה מרשימת המועדפים שלך",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "❌ שגיאה בהסרה",
        description: "לא ניתן להסיר את היהלום מרשימת המועדפים כרגע",
        variant: "destructive",
      });
    }
  };

  const contactSeller = (ownerTelegramId: number) => {
    window.open(`https://t.me/${ownerTelegramId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse text-lg">טוען רשימת מועדפים...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Alert Button */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">רשימת המועדפים שלי</h1>
        <p className="text-muted-foreground mb-4">
          {wishlistItems.length} יהלומים ברשימת המועדפים שלך
        </p>
        
        <Button
          onClick={() => setShowCreateAlert(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          צור התראת מחיר מותאמת אישית
        </Button>
      </div>

      {wishlistItems.length === 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">רשימת המועדפים ריקה</h3>
            <p className="text-muted-foreground mb-4">
              עדיין לא הוספת יהלומים לרשימת המועדפים שלך
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/store'}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                עבור לחנות
              </Button>
              <Button
                onClick={() => setShowCreateAlert(true)}
                variant="outline"
                className="w-full"
              >
                צור התראת מחיר
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wishlist Items */}
      <div className="grid gap-4">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg">
                  יהלום {item.diamond_data.stockNumber}
                </CardTitle>
                <CardDescription>
                  נוסף ב{new Date(item.created_at).toLocaleDateString('he-IL')}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFromWishlist(item.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium">צורה:</span>
                  <Badge variant="secondary" className="ml-2">
                    {item.diamond_data.shape}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">קרט:</span>
                  <span className="ml-2">{item.diamond_data.carat}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">צבע:</span>
                  <Badge variant="outline" className="ml-2">
                    {item.diamond_data.color}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">בהירות:</span>
                  <Badge variant="outline" className="ml-2">
                    {item.diamond_data.clarity}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => contactSeller(item.diamond_owner_telegram_id)}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  size="sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  צור קשר עם המוכר
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/diamond/${item.diamond_stock_number}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateAlert(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CreateWishlistAlert />
          </div>
        </div>
      )}
    </div>
  );
}
