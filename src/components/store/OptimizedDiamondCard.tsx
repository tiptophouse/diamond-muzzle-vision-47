
import { useState, memo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, MessageCircle, Gem, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { toast } from 'sonner';
import { Gem360Viewer } from "./Gem360Viewer";
import { formatCurrency } from "@/utils/numberUtils";

interface OptimizedDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
}

const OptimizedDiamondCard = memo(({ diamond, index, onUpdate }: OptimizedDiamondCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { impactOccurred } = useTelegramHapticFeedback();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // CRITICAL: Media detection with strict priority (3D > Image > Info Only)
  const has360 = !!(diamond.gem360Url && diamond.gem360Url.includes('.html'));
  const hasImage = !!(diamond.imageUrl && diamond.imageUrl !== 'default');
  
  console.log('🎯 CARD RENDER for', diamond.stockNumber, ':', {
    has360,
    hasImage,
    imageUrl: diamond.imageUrl,
    gem360Url: diamond.gem360Url,
    isVisible,
    price: diamond.price
  });

  const handleLike = useCallback(() => {
    impactOccurred('light');
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  }, [impactOccurred, isLiked]);

  const handleViewDetails = useCallback(() => {
    impactOccurred('light');
    navigate(`/diamond/${diamond.id}`);
  }, [impactOccurred, navigate, diamond.id]);

  const handleContact = useCallback(() => {
    impactOccurred('light');
    
    // Create deep link message for Telegram sharing
    const message = `💎 Interested in this diamond:\n\n` +
      `Stock: ${diamond.stockNumber}\n` +
      `${diamond.carat} ct ${diamond.shape}\n` +
      `${diamond.color} • ${diamond.clarity} • ${diamond.cut}\n` +
      `${diamond.price > 0 ? formatCurrency(diamond.price) : 'Contact for Price'}\n\n` +
      `View: ${window.location.origin}/catalog?stock=${diamond.stockNumber}`;
    
    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=&text=${encodedMessage}`;
    
    try {
      window.open(telegramUrl, '_blank');
      toast.success("Opening Telegram to contact...");
    } catch (error) {
      console.error('Failed to open Telegram:', error);
      toast.error("Failed to open contact options");
    }
  }, [impactOccurred, diamond]);

  const handleShare = useCallback(() => {
    impactOccurred('medium');
    
    const shareUrl = `${window.location.origin}/catalog?stock=${diamond.stockNumber}`;
    const shareText = `💎 Check out this ${diamond.carat} ct ${diamond.shape} diamond!\n${diamond.color} • ${diamond.clarity} • ${diamond.cut}\n${diamond.price > 0 ? formatCurrency(diamond.price) : 'Contact for Price'}`;
    
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    
    try {
      window.open(telegramShareUrl, '_blank');
      toast.success("Share link opened in Telegram");
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error("Failed to share");
    }
  }, [impactOccurred, diamond]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ IMAGE LOADED for', diamond.stockNumber);
    setImageLoaded(true);
    setImageError(false);
  }, [diamond.stockNumber]);

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    console.error('❌ IMAGE FAILED for', diamond.stockNumber, ':', target.src);
    setImageError(true);
    setImageLoaded(true);
  }, [diamond.stockNumber]);

  // Price display logic - show "Contact for Price" when price is 0
  const priceDisplay = diamond.price > 0 ? formatCurrency(diamond.price) : null;

  return (
    <div 
      ref={cardRef}
      id={`diamond-${diamond.stockNumber}`} 
      className="group relative bg-card rounded-xl overflow-hidden transition-all duration-200 border border-border/50 hover:border-border hover:shadow-md"
      style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
    >
      {/* Image Container with STRICT PRIORITY: 3D > Image > Info Only */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {/* Loading skeleton */}
        {!imageLoaded && (has360 || hasImage) && isVisible && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse z-10">
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        
        {/* PRIORITY 1: 360° Viewer (HIGHEST PRIORITY) */}
        {has360 && isVisible ? (
          <div className="relative w-full h-full">
            <Gem360Viewer 
              gem360Url={diamond.gem360Url!}
              stockNumber={diamond.stockNumber}
              isInline={true}
            />
          </div>
        ) : hasImage && isVisible ? (
          /* PRIORITY 2: Regular Image Display (SECOND PRIORITY) */
          <img 
            ref={imgRef}
            src={diamond.imageUrl} 
            alt={`${diamond.carat} ct ${diamond.shape} Diamond`} 
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* PRIORITY 3: Info Only Placeholder (LOWEST PRIORITY) */
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted-foreground/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gem className="h-8 w-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground">Info Only</p>
              {imageError && (
                <p className="text-xs text-red-500 mt-1">Image failed</p>
              )}
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge className="text-xs font-medium border-0 bg-green-500/90 text-white">
            Available
          </Badge>
        </div>

        {/* Media Type Badges */}
        <div className="absolute top-2 right-12 flex gap-1">
          {has360 && (
            <Badge className="text-xs font-medium border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
              ✨ 3D
            </Badge>
          )}
          {hasImage && !has360 && (
            <Badge className="text-xs font-medium border-0 bg-blue-500/90 text-white">
              📷 IMG
            </Badge>
          )}
        </div>

        {/* Action Icons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={handleShare}
            className="p-1 bg-background/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-background/90 hover:scale-110"
          >
            <Share2 className="h-3 w-3 text-muted-foreground hover:text-primary" />
          </button>
          <button
            onClick={handleLike}
            className="p-1 bg-background/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-background/90 hover:scale-110"
          >
            <Heart 
              className={`h-3 w-3 transition-colors ${
                isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              {diamond.carat} ct {diamond.shape}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {diamond.stockNumber}
            </p>
          </div>
          <div className="ml-2 text-right">
            {priceDisplay ? (
              <p className="text-sm font-bold text-foreground">
                {priceDisplay}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Contact for Price
              </p>
            )}
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium text-muted-foreground">
            {diamond.color}
          </span>
          <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium text-muted-foreground">
            {diamond.clarity}
          </span>
          <span className="text-xs font-medium text-yellow-600">
            {diamond.cut}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs border-border text-foreground hover:bg-muted"
            onClick={handleContact}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Contact
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleViewDetails}
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>
      </div>
    </div>
  );
});

OptimizedDiamondCard.displayName = 'OptimizedDiamondCard';

export { OptimizedDiamondCard };
