
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface LuxuryProductCardProps {
  diamond: any;
  onClick: () => void;
  onPurchaseClick: () => void;
}

export function LuxuryProductCard({ diamond, onClick, onPurchaseClick }: LuxuryProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPurchaseClick();
  };

  return (
    <Card 
      className="group cursor-pointer bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-slate-300/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-lg">
          <AspectRatio ratio={1}>
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              {diamond.imageUrl ? (
                <img
                  src={diamond.imageUrl}
                  alt={`${diamond.shape} Diamond`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                  <span className="text-slate-600 text-sm font-medium">💎</span>
                </div>
              )}
            </div>
          </AspectRatio>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg" />
          
          {/* Lab Badge */}
          {diamond.lab && (
            <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 border-slate-300">
              {diamond.lab}
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title and Specs */}
          <div>
            <h3 className="font-medium text-slate-900 text-lg mb-1">
              {diamond.carat} ct {diamond.shape}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>{diamond.color}</span>
              <span>•</span>
              <span>{diamond.clarity}</span>
              <span>•</span>
              <span>{diamond.cut}</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-2xl font-light text-slate-900">
            {formatPrice(diamond.price)}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>Stock: {diamond.stockNumber}</div>
            {diamond.certificateNumber && (
              <div>Cert: {diamond.certificateNumber}</div>
            )}
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchaseClick}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 transition-all duration-200 hover:shadow-lg"
          >
            Purchase Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
