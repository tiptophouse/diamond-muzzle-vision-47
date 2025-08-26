import React from 'react';
import { Diamond } from '@/types/diamond';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, ExternalLink } from 'lucide-react';

interface ProfessionalDiamondCardProps {
  diamond: Diamond;
  onAddToWishlist?: (diamond: Diamond) => void;
  onShare?: (diamond: Diamond) => void;
  onViewDetails?: (diamond: Diamond) => void;
}

export function ProfessionalDiamondCard({
  diamond,
  onAddToWishlist,
  onShare,
  onViewDetails,
}: ProfessionalDiamondCardProps) {
  

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
      <div className="aspect-square relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {diamond.picture ? (
          <img
            src={diamond.picture}
            alt={`${diamond.shape} ${diamond.carat}ct`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">💎</span>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {diamond.certificateUrl && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-white/90 text-gray-800 font-medium"
          >
            {diamond.certificateUrl}
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl text-gray-900">
                {diamond.shape} Diamond
              </h3>
              <p className="text-lg font-semibold text-gray-700">
                {diamond.carat} Carat
              </p>
            </div>
            {diamond.price && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ${diamond.price.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${Math.round(diamond.price / diamond.carat).toLocaleString()}/ct
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Color</span>
              <span className="font-semibold">{diamond.color}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Clarity</span>
              <span className="font-semibold">{diamond.clarity}</span>
            </div>
            {diamond.cut && (
              <div>
                <span className="text-muted-foreground block">Cut</span>
                <span className="font-semibold">{diamond.cut}</span>
              </div>
            )}
            {diamond.polish && (
              <div>
                <span className="text-muted-foreground block">Polish</span>
                <span className="font-semibold">{diamond.polish}</span>
              </div>
            )}
          </div>

          {diamond.certificateUrl && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Certificate: {diamond.certificateUrl}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {onAddToWishlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToWishlist(diamond)}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              <Heart className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(diamond)}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          
          {onViewDetails && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewDetails(diamond)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
