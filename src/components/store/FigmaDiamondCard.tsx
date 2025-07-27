
import React, { useState } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share, Eye, Star } from 'lucide-react';
import { useButtonFunctionality } from '@/hooks/useButtonFunctionality';
import { cn } from '@/lib/utils';

interface FigmaDiamondCardProps {
  diamond: Diamond;
  index?: number;
  onUpdate?: () => void;
}

export function FigmaDiamondCard({ diamond, index = 0, onUpdate }: FigmaDiamondCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 50) + 10);
  const { shareButton, createFunctionalButton } = useButtonFunctionality();

  const handleLike = createFunctionalButton(
    () => {
      setIsLiked(!isLiked);
      // Here you would typically update the backend
      console.log(`Diamond ${diamond.stockNumber} ${isLiked ? 'unliked' : 'liked'}`);
    },
    { 
      haptic: 'light',
      showToast: { 
        message: isLiked ? 'Removed from favorites' : 'Added to favorites',
        type: 'success' 
      }
    }
  );

  const handleShare = shareButton({
    title: `${diamond.carat}ct ${diamond.shape} Diamond`,
    text: `Check out this beautiful ${diamond.carat}ct ${diamond.color} ${diamond.clarity} ${diamond.shape} diamond - $${diamond.price.toLocaleString()}`,
    url: `${window.location.origin}/store?stock=${diamond.stockNumber}`
  });

  const handleView = createFunctionalButton(
    () => {
      setViewCount(prev => prev + 1);
      // Navigate to detailed view or open modal
      console.log(`Viewing diamond details: ${diamond.stockNumber}`);
      // You could navigate to a detail page or open a modal here
    },
    { haptic: 'medium' }
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getShapeEmoji = (shape: string) => {
    const shapeEmojis: { [key: string]: string } = {
      'Round': '💎',
      'Princess': '🔶',
      'Emerald': '🟢',
      'Asscher': '⬜',
      'Oval': '🥚',
      'Radiant': '✨',
      'Cushion': '🛏️',
      'Marquise': '🚢',
      'Pear': '🍐',
      'Heart': '💖',
    };
    return shapeEmojis[shape] || '💎';
  };

  return (
    <Card
      id={`diamond-${diamond.stockNumber}`}
      className={cn(
        "group relative bg-white hover:shadow-lg transition-all duration-300 cursor-pointer",
        "border border-gray-100 hover:border-blue-200 rounded-2xl overflow-hidden",
        "touch-target" // Ensure proper touch targets for mobile
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {diamond.imageUrl ? (
            <img
              src={diamond.imageUrl}
              alt={`${diamond.shape} Diamond ${diamond.stockNumber}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {getShapeEmoji(diamond.shape)}
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-8 w-8 p-0 rounded-full backdrop-blur-sm",
                isLiked 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-white/90 text-gray-700 hover:bg-white"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-blue-600 text-white font-semibold text-sm px-3 py-1 rounded-full">
              {formatPrice(diamond.price)}
            </Badge>
          </div>

          {/* View Count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            {viewCount}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {diamond.carat}ct {diamond.shape}
              </h3>
              <p className="text-sm text-gray-500">Stock #{diamond.stockNumber}</p>
            </div>
            
            {diamond.lab && (
              <Badge variant="outline" className="text-xs font-medium">
                {diamond.lab}
              </Badge>
            )}
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Color:</span>
                <span className="font-medium text-gray-900">{diamond.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Clarity:</span>
                <span className="font-medium text-gray-900">{diamond.clarity}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Cut:</span>
                <span className="font-medium text-gray-900">{diamond.cut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge 
                  variant={diamond.status === 'available' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {diamond.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleView}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition-colors touch-target"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
