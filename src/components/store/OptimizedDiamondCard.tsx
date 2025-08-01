
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

  // VERIFICATION LOGGING: Let me check what data we're getting
  useEffect(() => {
    console.log('🔍 DIAMOND CARD VERIFICATION for', diamond.stockNumber, ':', {
      imageUrl: diamond.imageUrl,
      picture: diamond.picture,
      Image: diamond.Image,
      image: diamond.image,
      'Video link': diamond['Video link'],
      videoLink: diamond.videoLink,
      gem360Url: diamond.gem360Url,
      allFields: Object.keys(diamond)
    });
  }, [diamond]);

  // Enhanced image URL detection with better validation and comprehensive logging
  const getImageUrl = useCallback(() => {
    console.log('🖼️ GETTING IMAGE URL for', diamond.stockNumber);
    
    // Try multiple possible image fields in priority order
    const possibleImageUrls = [
      diamond.Image,     // CSV Image field (highest priority)
      diamond.imageUrl,  // Standard imageUrl field
      diamond.picture,   // Alternative picture field
      diamond.image,     // Lowercase image field
    ];

    console.log('🔍 IMAGE URL CANDIDATES:', {
      stockNumber: diamond.stockNumber,
      Image: diamond.Image,
      imageUrl: diamond.imageUrl,
      picture: diamond.picture,
      image: diamond.image
    });

    for (let i = 0; i < possibleImageUrls.length; i++) {
      const url = possibleImageUrls[i];
      console.log(`🔍 CHECKING URL ${i + 1}:`, url);
      
      if (url && typeof url === 'string' && url.trim()) {
        const cleanUrl = url.trim();
        
        // Validate URL format - must start with http/https or be a relative path
        if (cleanUrl.match(/^(https?:\/\/|\/\/)/)) {
          // Exclude 360° HTML files from regular image display
          if (!cleanUrl.includes('.html')) {
            console.log('✅ VALID IMAGE URL FOUND:', cleanUrl);
            return cleanUrl;
          } else {
            console.log('⚠️ SKIPPING HTML URL (360° content):', cleanUrl);
          }
        } else {
          console.log('❌ INVALID URL FORMAT:', cleanUrl);
        }
      } else {
        console.log('❌ EMPTY/INVALID URL:', url);
      }
    }
    
    console.log('❌ NO VALID IMAGE URL FOUND for', diamond.stockNumber);
    return null;
  }, [diamond]);

  // Get 360° URL with logging
  const get360Url = useCallback(() => {
    console.log('🔍 GETTING 360° URL for', diamond.stockNumber);
    
    // Check gem360Url first
    if (diamond.gem360Url && diamond.gem360Url.trim()) {
      const url = diamond.gem360Url.trim();
      if (url.includes('.html')) {
        console.log('✅ FOUND 360° URL in gem360Url:', url);
        return url;
      }
    }

    // Check Video link field from CSV
    const videoLink = diamond['Video link'] || diamond.videoLink;
    if (videoLink && typeof videoLink === 'string' && videoLink.trim()) {
      const cleanVideoUrl = videoLink.trim();
      if (cleanVideoUrl.includes('.html')) {
        console.log('✅ FOUND 360° URL in Video link:', cleanVideoUrl);
        return cleanVideoUrl;
      }
    }

    console.log('❌ NO 360° URL FOUND for', diamond.stockNumber);
    return null;
  }, [diamond]);

  // Enhanced 360° detection
  const is360Image = useCallback(() => {
    const gem360Url = get360Url();
    const result = !!gem360Url && gem360Url.includes('.html');
    console.log('🔍 IS 360° IMAGE:', result, 'for', diamond.stockNumber);
    return result;
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
    console.log('✅ IMAGE LOADED SUCCESSFULLY for', diamond.stockNumber);
    setImageLoaded(true);
    setImageError(false);
  }, [diamond.stockNumber]);

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    console.error('❌ IMAGE FAILED TO LOAD for', diamond.stockNumber, ':', {
      src: target.src,
      error: event.type,
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight
    });
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

  // FINAL VERIFICATION LOG
  console.log('🔍 FINAL RENDER STATE for', diamond.stockNumber, ':', {
    hasImage,
    has360,
    imageUrl,
    gem360Url,
    isVisible,
    imageLoaded,
    imageError,
    willShowImage: hasImage && !has360 && isVisible,
    willShow360: has360 && isVisible
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
        {!imageLoaded && (hasImage || has360) && isVisible && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse z-10">
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        
        {/* 360° Viewer for .html URLs */}
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
                <p className="text-xs text-red-500 mt-1">Failed to load</p>
              )}
              {hasImage && (
                <p className="text-xs text-muted-foreground mt-1 px-2 break-all">
                  {imageUrl?.substring(0, 50)}...
                </p>
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
