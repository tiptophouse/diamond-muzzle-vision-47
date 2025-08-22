import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Eye } from 'lucide-react';
import { Diamond } from '@/types/diamond';

interface OptimizedDiamondCardProps {
  diamond: Diamond;
  onAddToWishlist?: (diamond: Diamond) => void;
  onShare?: (diamond: Diamond) => void;
  onViewDetails?: (diamond: Diamond) => void;
}

export function OptimizedDiamondCard({
  diamond,
  onAddToWishlist,
  onShare,
  onViewDetails,
}: OptimizedDiamondCardProps) {

  const isFancyColor = diamond.color_type === 'fancy' || 
    (diamond.color && !['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].includes(diamond.color));
  
  const fancyColorDisplay = diamond.color_type === 'fancy' ? diamond.color : diamond.color;
  const shouldShowFancyBadge = diamond.color_type === 'fancy' || isFancyColor;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100">
        {diamond.picture ? (
          <img
            src={diamond.picture}
            alt={`${diamond.shape} ${diamond.carat}ct`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
          </div>
        )}
        
        {shouldShowFancyBadge && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-purple-100 text-purple-800"
          >
            Fancy Color
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">
              {diamond.shape} {diamond.carat}ct
            </h3>
            {diamond.price && (
              <p className="font-bold text-lg text-primary">
                ${diamond.price.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{fancyColorDisplay}</span>
            <span>•</span>
            <span>{diamond.clarity}</span>
            {diamond.cut && (
              <>
                <span>•</span>
                <span>{diamond.cut}</span>
              </>
            )}
          </div>

          {diamond.certificateNumber && (
            <p className="text-xs text-muted-foreground">
              Cert: {diamond.certificateNumber}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {onAddToWishlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToWishlist(diamond)}
              className="flex-1"
            >
              <Heart className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(diamond)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          
          {onViewDetails && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewDetails(diamond)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
