
import { useState, memo, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramAccelerometer } from "@/hooks/useTelegramAccelerometer";
import { toast } from 'sonner';

interface FigmaDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
}

function FigmaDiamondCard({
  diamond,
  index,
  onUpdate
}: FigmaDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { impactOccurred } = useTelegramHapticFeedback();
  const { orientationData } = useTelegramAccelerometer(true);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLike = useCallback(() => {
    impactOccurred('light');
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  }, [impactOccurred, isLiked]);

  const handleViewDetails = useCallback(() => {
    impactOccurred('light');
    navigate(`/diamond/${diamond.stockNumber}/immersive`);
  }, [impactOccurred, navigate, diamond.stockNumber]);

  const handleContact = useCallback(() => {
    impactOccurred('light');
    toast.success("Opening contact options...");
  }, [impactOccurred]);

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

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const isAvailable = useMemo(() => diamond.status === "Available", [diamond.status]);

  const imageTransform = useMemo(() => {
    return diamond.imageUrl && !imageError 
      ? `perspective(1000px) rotateX(${orientationData.beta * 0.2}deg) rotateY(${orientationData.gamma * 0.2}deg)`
      : undefined;
  }, [diamond.imageUrl, imageError, orientationData.beta, orientationData.gamma]);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(diamond.price);
  }, [diamond.price]);

  return (
    <div 
      ref={cardRef}
      id={`diamond-${diamond.stockNumber}`} 
      className="group relative bg-card rounded-2xl overflow-hidden transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse">
            <div className="flex items-center justify-center h-full">
              <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-muted-foreground/40 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        {diamond.imageUrl && !imageError && isVisible ? (
          <img 
            ref={imgRef}
            src={diamond.imageUrl} 
            alt={`${diamond.carat} ct ${diamond.shape} Diamond`} 
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transform: imageTransform }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        ) : imageError ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted-foreground/10">
            <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-muted-foreground/40 rounded-full"></div>
            </div>
          </div>
        ) : null}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            className={`text-xs font-medium border-0 ${
              isAvailable 
                ? "bg-green-500/90 text-white" 
                : "bg-blue-500/90 text-white"
            }`}
          >
            {isAvailable ? "Available" : "Premium"}
          </Badge>
        </div>

        {/* Heart Icon */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-background/90 hover:scale-110 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
            }`} 
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-tight truncate">
              {diamond.carat} ct {diamond.shape}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {diamond.stockNumber}
            </p>
          </div>
          <p className="text-lg font-bold text-foreground ml-2">
            {formattedPrice}
          </p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-muted px-2 py-1 rounded-md text-xs font-medium text-muted-foreground">
            {diamond.color}
          </span>
          <span className="bg-muted px-2 py-1 rounded-md text-xs font-medium text-muted-foreground">
            {diamond.clarity}
          </span>
          <span className="text-xs font-medium text-yellow-600">
            Very Good
          </span>
        </div>

        {/* Fixed Action Buttons with proper Telegram styling */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 min-h-[44px] px-4 py-3 border-border text-foreground hover:bg-muted touch-target bg-background"
            onClick={handleContact}
          >
            <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">Contact</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 min-h-[44px] px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 touch-target"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">Details</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(FigmaDiamondCard);
export { FigmaDiamondCard };
