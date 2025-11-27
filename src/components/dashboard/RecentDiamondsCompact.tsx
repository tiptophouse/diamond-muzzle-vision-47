import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Share2, Gavel, Package, ArrowRight } from 'lucide-react';

interface RecentDiamondsCompactProps {
  diamonds: Diamond[];
}

export function RecentDiamondsCompact({ diamonds }: RecentDiamondsCompactProps) {
  const navigate = useNavigate();
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price.toLocaleString()}`;
  };

  const handleDiamondClick = (stockNumber: string) => {
    selectionChanged();
    navigate(`/inventory?stock=${stockNumber}`);
  };

  const handleShare = (e: React.MouseEvent, stockNumber: string) => {
    e.stopPropagation();
    impactOccurred('light');
    navigate(`/store?stock=${stockNumber}`);
  };

  const handleAuction = (e: React.MouseEvent, stockNumber: string) => {
    e.stopPropagation();
    impactOccurred('light');
    navigate(`/auctions?stock=${stockNumber}`);
  };

  if (diamonds.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-foreground">Recent Diamonds</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/inventory')}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {diamonds.map((diamond) => (
            <div
              key={diamond.id}
              onClick={() => handleDiamondClick(diamond.stockNumber)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {diamond.imageUrl ? (
                  <img 
                    src={diamond.imageUrl} 
                    alt={`${diamond.shape} diamond`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {diamond.carat}ct {diamond.shape} {diamond.color}/{diamond.clarity}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  Stock #{diamond.stockNumber}
                </div>
              </div>

              {/* Price + Actions */}
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-primary mb-1">
                  {formatPrice(diamond.price)}
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={(e) => handleShare(e, diamond.stockNumber)}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={(e) => handleAuction(e, diamond.stockNumber)}
                  >
                    <Gavel className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
