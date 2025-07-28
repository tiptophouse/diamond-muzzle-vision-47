
import React, { useState, useEffect } from 'react';
import { Eye, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/hooks/useWishlist';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { MobileShareButton } from './MobileShareButton';
import { Diamond } from '@/components/inventory/InventoryTable';

interface FigmaDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate: () => void;
}

export function FigmaDiamondCard({ diamond, index, onUpdate }: FigmaDiamondCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToWishlist, removeFromWishlist, checkIsInWishlist } = useWishlist();
  const { hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user?.id) {
        const inWishlist = await checkIsInWishlist(diamond.stockNumber);
        setIsInWishlist(inWishlist);
      }
    };
    checkWishlistStatus();
  }, [diamond.stockNumber, checkIsInWishlist, user?.id]);

  const handleWishlistToggle = async () => {
    if (!user?.id) return;
    
    hapticFeedback.impact('medium');
    
    if (isInWishlist) {
      const success = await removeFromWishlist(diamond.stockNumber);
      if (success) {
        setIsInWishlist(false);
        onUpdate();
      }
    } else {
      const success = await addToWishlist(diamond, user.id);
      if (success) {
        setIsInWishlist(true);
        onUpdate();
      }
    }
  };

  const handleContact = () => {
    hapticFeedback.selection();
    const message = `Hi! I'm interested in your ${diamond.carat}ct ${diamond.shape} diamond (Stock #${diamond.stockNumber}). Could you provide more details?`;
    window.open(`tg://resolve?domain=mazalbot&text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleViewDetails = () => {
    hapticFeedback.selection();
    window.location.href = `/store?stock=${diamond.stockNumber}`;
  };

  const handle3DView = () => {
    if (diamond.gem360Url) {
      hapticFeedback.impact('light');
      window.open(diamond.gem360Url, '_blank');
    }
  };

  const pricePerCarat = Math.round(diamond.price / diamond.carat);

  return (
    <Card 
      id={`diamond-${diamond.stockNumber}`}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-4">
        {/* Image Section */}
        <div className="relative w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 overflow-hidden">
          {diamond.imageUrl && !imageError ? (
            <>
              <img 
                src={diamond.imageUrl} 
                alt={`${diamond.carat}ct ${diamond.shape} Diamond`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />
              {diamond.gem360Url && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handle3DView}
                  className="absolute top-2 left-2 bg-black/70 hover:bg-black/80 text-white border-0 h-7 px-2"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  360°
                </Button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-2">
                <span className="text-2xl">💎</span>
              </div>
              <span className="text-xs">No Image</span>
            </div>
          )}
          
          {/* Wishlist Heart */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white border-0 h-8 w-8 p-0 rounded-full shadow-sm"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`} 
            />
          </Button>
        </div>

        {/* Diamond Info */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg leading-tight">{diamond.stockNumber}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {diamond.shape}
                </Badge>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {diamond.carat}ct
                </Badge>
              </div>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium">{diamond.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clarity:</span>
              <span className="font-medium">{diamond.clarity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cut:</span>
              <span className="font-medium">{diamond.cut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lab:</span>
              <span className="font-medium">{diamond.lab || 'N/A'}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-green-600">
                ${diamond.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                ${pricePerCarat.toLocaleString()}/ct
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="h-9 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleContact}
                className="h-9 px-2 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Contact
              </Button>
              <MobileShareButton 
                diamond={diamond} 
                className="h-9 px-2 text-xs"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
