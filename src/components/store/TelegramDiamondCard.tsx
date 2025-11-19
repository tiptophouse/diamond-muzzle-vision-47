import { useState, useCallback, useEffect } from "react";
import { MessageCircle, Eye, Share2, ArrowRight, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "@/components/inventory/InventoryTable";
import { TelegramOptimizedImage } from "@/components/ui/TelegramOptimizedImage";
import { UniversalImageHandler } from "./UniversalImageHandler";
import { TelegramShareButton } from "./TelegramShareButton";
import { LimitedGroupShareButton } from "./LimitedGroupShareButton";
import { CreateAuctionDialog } from "@/components/auction/CreateAuctionDialog";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useNavigate } from "react-router-dom";
import { imagePreloader } from "@/utils/imagePreloader";

interface TelegramDiamondCardProps {
  diamond: Diamond;
  index: number;
  onViewDetails?: (diamond: Diamond) => void;
}

export function TelegramDiamondCard({ diamond, index, onViewDetails }: TelegramDiamondCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const { hapticFeedback, mainButton, backButton } = useTelegramWebApp();
  const { user } = useTelegramAuth();
  const navigate = useNavigate();

  // Check if user owns this diamond (from FastAPI user_id or diamondId)
  const diamondUserId = (diamond as any).user_id || (diamond as any).userId;
  const isOwner = user?.id && diamondUserId && user.id === diamondUserId;

  // Priority loading for first 6 cards
  const isPriority = index < 6;
  
  // Preload next images for smooth scrolling
  useEffect(() => {
    if (isPriority && diamond.gem360Url) {
      imagePreloader.preload(diamond.gem360Url, { priority: 'high', format: 'auto' });
    } else if (diamond.imageUrl) {
      imagePreloader.preload(diamond.imageUrl, { priority: isPriority ? 'high' : 'low', format: 'auto' });
    }
  }, [diamond.gem360Url, diamond.imageUrl, isPriority]);

  const handleViewDetails = useCallback(() => {
    hapticFeedback.impact('light');
    
    if (onViewDetails) {
      onViewDetails(diamond);
    } else {
      navigate(`/diamond/${diamond.stockNumber}`);
    }
  }, [diamond, onViewDetails, navigate, hapticFeedback]);

  const handleContact = useCallback(() => {
    hapticFeedback.impact('medium');
    
    const message = `💎 Interested in Diamond #${diamond.stockNumber}

🔸 Shape: ${diamond.shape}
⚖️ Weight: ${diamond.carat}ct  
🎨 Color: ${diamond.color}
💎 Clarity: ${diamond.clarity}
💰 Price: $${diamond.price.toLocaleString()}

Could you please provide more details?`;

    // Try to use Telegram's WebApp interface with safe type checking
    try {
      const tgWebApp = window.Telegram?.WebApp as any;
      if (tgWebApp && tgWebApp.switchInlineQuery) {
        tgWebApp.switchInlineQuery(message, ['users']);
      } else {
        // Fallback for non-Telegram environments
        const telegramUrl = `https://t.me/share/url?text=${encodeURIComponent(message)}`;
        window.open(telegramUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to open contact:', error);
      // Final fallback - copy to clipboard
      navigator.clipboard.writeText(message);
    }
  }, [diamond, hapticFeedback]);

  // Prepare share content
  const shareTitle = `${diamond.carat}ct ${diamond.shape} Diamond`;
  const shareText = `💎 ${diamond.carat}ct ${diamond.shape} Diamond

🔸 Shape: ${diamond.shape}
⚖️ Weight: ${diamond.carat}ct
🎨 Color: ${diamond.color}
💎 Clarity: ${diamond.clarity}
✂️ Cut: ${diamond.cut}
💰 Price: $${diamond.price.toLocaleString()}
📋 Stock #: ${diamond.stockNumber}

View details: ${window.location.origin}/diamond/${diamond.stockNumber}`;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      {/* Optimized Image Container */}
      <div className="relative h-48">
        {/* Enhanced image handling with Segoma support for user 2084882603 */}
        {diamond.gem360Url ? (
          <UniversalImageHandler
            imageUrl={diamond.gem360Url}
            stockNumber={diamond.stockNumber}
            isInline={true}
            className="w-full h-full"
          />
        ) : (
          <TelegramOptimizedImage
            stockNumber={diamond.stockNumber}
            src={diamond.imageUrl}
            alt={`${diamond.carat}ct ${diamond.shape} Diamond - Stock #${diamond.stockNumber}`}
            className="w-full h-full"
            priority={isPriority ? 'high' : 'medium'}
            fallbackUrl={`https://miniapp.mazalbot.com/api/diamond-image/${diamond.stockNumber}`}
            onLoad={() => setImageLoaded(true)}
            showMetrics={process.env.NODE_ENV === 'development'}
          />
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            className={`${
              diamond.status === "Available" 
                ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                : "bg-blue-100 text-blue-800 border-blue-300"
            } text-xs`}
            variant="outline"
          >
            {diamond.status}
          </Badge>
        </div>

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            onClick={handleViewDetails}
            size="sm"
            className="bg-white/90 text-gray-900 hover:bg-white shadow-lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4 space-y-3">
        {/* Header with Stock Number and Price */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            #{diamond.stockNumber}
          </span>
          <span className="text-lg font-bold text-foreground">
            ${diamond.price.toLocaleString()}
          </span>
        </div>

        {/* Diamond Title */}
        <div>
          <h3 className="font-semibold text-foreground text-base leading-tight">
            {diamond.carat} ct {diamond.shape}
          </h3>
        </div>
        
        {/* Diamond Specifications Grid */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Color</p>
            <Badge variant="outline" className="text-xs mt-1">{diamond.color}</Badge>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Clarity</p>
            <Badge variant="outline" className="text-xs mt-1">{diamond.clarity}</Badge>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Cut</p>
            <Badge variant="outline" className="text-xs mt-1">{diamond.cut}</Badge>
          </div>
        </div>

        {/* Telegram-Optimized Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {/* View Details - Primary Action */}
          <Button
            onClick={handleViewDetails}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground col-span-2"
          >
            <ArrowRight className="h-3 w-3 mr-1" />
            Details
          </Button>

          {/* Telegram Share */}
          <TelegramShareButton
            title={shareTitle}
            text={shareText}
            size="sm"
            variant="outline"
            className="px-2"
          >
            <Share2 className="h-3 w-3" />
          </TelegramShareButton>
        </div>

        {/* Post to Auction - Owner Only */}
        {isOwner && (
          <Button
            onClick={() => {
              hapticFeedback.impact('medium');
              setShowAuctionDialog(true);
            }}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Hammer className="h-3 w-3 mr-2" />
            Post to Auction
          </Button>
        )}

        {/* Premium Group Share Button */}
        <LimitedGroupShareButton 
          diamond={diamond} 
          size="sm"
          className="w-full"
        />

        {/* Contact Button - Telegram Optimized */}
        <Button 
          onClick={handleContact}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          <MessageCircle className="h-3 w-3 mr-2" />
          Contact in Telegram
        </Button>
      </CardContent>

      {/* Auction Creation Dialog */}
      <CreateAuctionDialog
        diamond={diamond}
        open={showAuctionDialog}
        onOpenChange={setShowAuctionDialog}
        onSuccess={() => {
          navigate('/auctions');
        }}
      />
    </Card>
  );
}