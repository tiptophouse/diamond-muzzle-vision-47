import { useState, useCallback } from "react";
import { MessageCircle, Eye, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "@/components/inventory/InventoryTable";
import { OptimizedDiamondImage } from "./OptimizedDiamondImage";
import { TelegramShareButton } from "./TelegramShareButton";
import { LimitedGroupShareButton } from "./LimitedGroupShareButton";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useNavigate } from "react-router-dom";

interface TelegramDiamondCardProps {
  diamond: Diamond;
  index: number;
  onViewDetails?: (diamond: Diamond) => void;
}

export function TelegramDiamondCard({ diamond, index, onViewDetails }: TelegramDiamondCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { hapticFeedback, mainButton, backButton } = useTelegramWebApp();
  const { user } = useTelegramAuth();
  const navigate = useNavigate();

  // Priority loading for first 6 cards
  const isPriority = index < 6;

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
        <OptimizedDiamondImage
          imageUrl={diamond.imageUrl}
          gem360Url={diamond.gem360Url}
          stockNumber={diamond.stockNumber}
          shape={diamond.shape}
          className="w-full h-full"
          priority={isPriority}
          onLoad={() => setImageLoaded(true)}
        />
        
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
    </Card>
  );
}