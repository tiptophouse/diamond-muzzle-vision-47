
import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Eye, Share2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AddWishlistItemModal } from './AddWishlistItemModal';

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
  const [showAddModal, setShowAddModal] = useState(false);
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

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <span className="text-sm text-gray-500">({wishlistItems.length} items)</span>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Preference
          </Button>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">
              Add diamonds from the store or create custom preferences to get notified when matching diamonds are uploaded
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/store'}
                variant="outline"
              >
                Browse Store
              </Button>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Preference
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlistItems.map((item) => {
              const diamond = item.diamond_data;
              const isCustomPreference = item.diamond_owner_telegram_id === 0;
              const totalPrice = diamond.price_per_carat ? diamond.price_per_carat * diamond.carat : diamond.price;
              
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {diamond.imageUrl && !isCustomPreference && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img 
                          src={diamond.imageUrl} 
                          alt={`${diamond.shape} Diamond`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {isCustomPreference && (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                        <div className="text-center">
                          <Heart className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600">Custom Preference</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm">
                          {isCustomPreference ? 'Custom Preference' : diamond.stockNumber}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromWishlist(item.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{diamond.shape}</Badge>
                        <Badge variant="secondary" className="text-xs">{diamond.carat}ct</Badge>
                        <Badge variant="secondary" className="text-xs">{diamond.color}</Badge>
                        <Badge variant="secondary" className="text-xs">{diamond.clarity}</Badge>
                      </div>
                      
                      {isCustomPreference && (
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <p className="text-blue-700 font-medium">
                            🔔 You'll be notified when matching diamonds are uploaded!
                          </p>
                        </div>
                      )}
                      
                      {totalPrice && (
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-lg font-bold text-green-600">
                            ${totalPrice.toLocaleString()}
                          </div>
                          {diamond.price_per_carat && (
                            <div className="text-xs text-gray-500">
                              ${diamond.price_per_carat}/ct
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!isCustomPreference && (
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
                      )}
                      
                      <div className="text-xs text-gray-400 pt-1">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddWishlistItemModal 
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={fetchWishlist}
      />
    </>
  );
}
