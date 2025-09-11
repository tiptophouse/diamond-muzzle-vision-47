import React from 'react';
import { useProductionTelegramApp } from '@/hooks/useProductionTelegramApp';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FastImage } from '@/components/ui/fast-image';
import { 
  Diamond, 
  Share2, 
  Eye,
  Heart,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiamondData {
  id?: string;
  stockNumber?: string;
  stock_number?: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price: number;
  price_per_carat?: number;
  picture?: string;
  certificate_url?: string;
}

interface ProductionDiamondCardProps {
  diamond: DiamondData;
  index?: number;
  onViewDetails?: (diamond: DiamondData) => void;
  onShare?: (diamond: DiamondData) => void;
  onFavorite?: (diamond: DiamondData) => void;
}

export function ProductionDiamondCard({ 
  diamond, 
  index = 0, 
  onViewDetails, 
  onShare, 
  onFavorite 
}: ProductionDiamondCardProps) {
  const { haptic } = useProductionTelegramApp();
  
  const handleCardClick = () => {
    haptic.selection();
    if (onViewDetails) {
      onViewDetails(diamond);
    }
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.impact('light');
    if (onShare) {
      onShare(diamond);
    }
  };
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.impact('medium');
    if (onFavorite) {
      onFavorite(diamond);
    }
  };
  
  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  const totalPrice = Number(diamond.price_per_carat || diamond.price || 0) * Number(diamond.weight || 0);
  const pricePerCarat = Number(diamond.price_per_carat || diamond.price || 0);
  
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1 active:scale-98",
        "border-0 shadow-md bg-card/90 backdrop-blur-sm",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <FastImage
            src={diamond.picture || '/placeholder-diamond.jpg'}
            fallbackSrc="/placeholder-diamond.jpg"
            alt={`${diamond.shape} Diamond`}
            className="w-full h-full"
            priority={index < 4}
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <Share2 className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={handleFavorite}
                className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <Heart className="h-4 w-4 text-foreground" />
              </button>
            </div>
          </div>
          
          {/* Quality Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge 
              variant="secondary" 
              className="bg-background/90 backdrop-blur-sm text-foreground border-0"
            >
              <Diamond className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">
                {diamond.shape} {diamond.weight}ct
              </h3>
              <div className="flex items-center gap-1 text-primary">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Hot</span>
              </div>
            </div>
            
            {/* Specifications */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {diamond.color}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {diamond.clarity}
              </Badge>
              {diamond.cut && (
                <Badge variant="outline" className="text-xs">
                  {diamond.cut}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(totalPrice)}
              </span>
              <span className="text-sm text-muted-foreground">
                Total Value
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ${pricePerCarat.toLocaleString()}/ct
              </span>
              <span className="text-xs text-muted-foreground">
                Stock #{diamond.stockNumber || diamond.stock_number}
              </span>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="pt-2">
            <div className="flex items-center justify-center w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium group-hover:bg-primary/20 transition-colors">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}