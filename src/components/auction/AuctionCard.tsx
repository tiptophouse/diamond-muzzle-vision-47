import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hammer, Clock, TrendingUp, Gem } from "lucide-react";
import { AuctionWithDiamond } from "@/hooks/useAuctionsData";
import { useNavigate } from "react-router-dom";
import { getTelegramWebApp } from "@/utils/telegramWebApp";

interface AuctionCardProps {
  auction: AuctionWithDiamond;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const navigate = useNavigate();
  const tg = getTelegramWebApp();

  const timeRemaining = () => {
    const now = new Date();
    const end = new Date(auction.ends_at);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const handleViewAuction = () => {
    if (tg && 'HapticFeedback' in tg) {
      (tg as any).HapticFeedback?.impactOccurred('light');
    }
    navigate(`/auction/${auction.id}`);
  };

  const diamond = auction.diamond;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-card">
      <div className="relative aspect-square bg-muted">
        {diamond?.picture ? (
          <img
            src={diamond.picture}
            alt={`${diamond.shape} diamond`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gem className="h-16 w-16 text-muted-foreground opacity-30" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            <Clock className="h-3 w-3 mr-1" />
            {timeRemaining()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Diamond Info */}
        {diamond && (
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">
              {diamond.weight}ct {diamond.shape}
            </h3>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{diamond.color}</span>
              <span>•</span>
              <span>{diamond.clarity}</span>
              {diamond.cut && (
                <>
                  <span>•</span>
                  <span>{diamond.cut}</span>
                </>
              )}
            </div>
            {diamond.certificate_number && (
              <p className="text-xs text-muted-foreground">
                {diamond.lab || 'GIA'} #{diamond.certificate_number}
              </p>
            )}
          </div>
        )}

        {/* Price Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Bid</span>
            <span className="text-lg font-bold text-foreground">
              ${auction.current_price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Starting: ${auction.starting_price.toLocaleString()}</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{auction.bid_count} bids</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleViewAuction}
          className="w-full"
          size="sm"
        >
          <Hammer className="h-4 w-4 mr-2" />
          Place Bid
        </Button>
      </CardContent>
    </Card>
  );
}
