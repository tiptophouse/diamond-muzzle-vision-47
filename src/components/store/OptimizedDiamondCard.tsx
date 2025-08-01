
import { useState, memo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, MessageCircle, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { toast } from 'sonner';
import { Gem360Viewer } from "./Gem360Viewer";

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

  // Get the best available image URL with enhanced validation
  const getImageUrl = useCallback(() => {
    // Try multiple possible image fields
    const possibleImageUrls = [
      diamond.imageUrl,
      diamond.picture,
      diamond.Image, // From CSV data
      diamond.image  // Alternative field name
    ];

    console.log('🖼️ OptimizedDiamondCard - Checking image sources for', diamond.stockNumber, ':', {
      imageUrl: diamond.imageUrl,
      picture: diamond.picture,
      Image: (diamond as any).Image,
      image: (diamond as any).image
    });

    for (const url of possibleImageUrls) {
      if (url && typeof url === 'string' && url.trim()) {
        const cleanUrl = url.trim();
        
        // Validate URL format
        if (cleanUrl.startsWith('http') || cleanUrl.startsWith('//')) {
          console.log('✅ OptimizedDiamondCard - Valid image URL found for', diamond.stockNumber, ':', cleanUrl);
          return cleanUrl;
        }
      }
    }
    
    console.log('❌ OptimizedDiamondCard - No valid image URL found for', diamond.stockNumber);
    return null;
  }, [diamond.imageUrl, diamond.picture, diamond.stockNumber, diamond]);

  // Get 360° URL - separate from regular image
  const get360Url = useCallback(() => {
    // Check for dedicated gem360Url first
    if (diamond.gem360Url && diamond.gem360Url.trim()) {
      return diamond.gem360Url.trim();
    }

    // Check for Video link field (from CSV - often contains 360° links)
    const videoLink = (diamond as any)['Video link'] || (diamond as any).videoLink;
    if (videoLink && typeof videoLink === 'string' && videoLink.trim()) {
      const cleanVideoUrl = videoLink.trim();
      if (cleanVideoUrl.includes('.html') || cleanVideoUrl.includes('360')) {
        return cleanVideoUrl;
      }
    }

    return null;
  }, [diamond.gem360Url, diamond]);

  // Enhanced 360° detection
  const is360Image = useCallback(() => {
    const gem360Url = get360Url();
    
    // If we have a dedicated 360° URL, it's definitely 360° content
    if (gem360Url) {
      console.log('🔄 OptimizedDiamondCard - Has 360° URL for', diamond.stockNumber, ':', gem360Url);
      return true;
    }

    return false;
  }, [get360Url, diamond.stockNumber]);

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
    toast.success("Opening contact options...");
  }, [impactOccurred]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ OptimizedDiamondCard - Image loaded successfully for', diamond.stockNumber);
    setImageLoaded(true);
    setImageError(false);
  }, [diamond.stockNumber]);

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ OptimizedDiamondCard - Image failed to load for', diamond.stockNumber, ':', event.currentTarget.src);
    setImageError(true);
    setImageLoaded(true);
  }, [diamond.stockNumber]);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(diamond.price);

  const imageUrl = getImageUrl();
  const gem360Url = get360Url();
  const hasImage = !!imageUrl;
  const has360 = is360Image();

  console.log('🔍 OptimizedDiamondCard - Final render state for', diamond.stockNumber, ':', {
    hasImage,
    has360,
    imageUrl,
    gem360Url,
    isVisible,
    imageLoaded,
    imageError
  });

  return (
    <div 
      ref={cardRef}
      id={`diamond-${diamond.stockNumber}`} 
      className="group relative bg-card rounded-xl overflow-hidden transition-all duration-200 border border-border/50 hover:border-border"
      style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {/* Loading skeleton */}
        {!imageLoaded && hasImage && isVisible && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse z-10">
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        
        {/* 360° Viewer for vision360.html URLs */}
        {has360 && gem360Url && isVisible ? (
          <div className="relative w-full h-full">
            <Gem360Viewer 
              gem360Url={gem360Url}
              stockNumber={diamond.stockNumber}
              isInline={true}
            />
          </div>
        ) : hasImage && !imageError && isVisible ? (
          /* Regular Image Display */
          <img 
            ref={imgRef}
            src={imageUrl} 
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
          /* No Image Placeholder */
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted-foreground/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gem className="h-8 w-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground">No Image</p>
              {imageError && (
                <p className="text-xs text-red-500 mt-1">Load failed</p>
              )}
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge 
            className="text-xs font-medium border-0 bg-green-500/90 text-white"
          >
            Available
          </Badge>
        </div>

        {/* 360° Badge */}
        {has360 && (
          <div className="absolute top-2 right-12">
            <Badge className="text-xs font-medium border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
              ✨ 360°
            </Badge>
          </div>
        )}

        {/* Heart Icon */}
        <button
          onClick={handleLike}
          className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-background/90 hover:scale-110"
        >
          <Heart 
            className={`h-3 w-3 transition-colors ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
            }`} 
          />
        </button>
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
          <p className="text-sm font-bold text-foreground ml-2">
            {formattedPrice}
          </p>
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
