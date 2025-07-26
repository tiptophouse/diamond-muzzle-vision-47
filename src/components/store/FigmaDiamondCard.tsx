
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramAccelerometer } from "@/hooks/useTelegramAccelerometer";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from 'sonner';

interface FigmaDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
}

export function FigmaDiamondCard({
  diamond,
  index,
  onUpdate
}: FigmaDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { impactOccurred } = useTelegramHapticFeedback();
  const { orientationData } = useTelegramAccelerometer(true);
  const { addToWishlist, isLoading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();

  const handleLike = async () => {
    impactOccurred('light');
    
    if (!isLiked) {
      const success = await addToWishlist(diamond, diamond.user_id || 0);
      if (success) {
        setIsLiked(true);
        toast.success("Added to wishlist - you'll be notified when similar diamonds are uploaded!");
      }
    } else {
      setIsLiked(false);
      toast.success("Removed from wishlist");
    }
  };

  const handleViewDetails = () => {
    impactOccurred('light');
    navigate(`/diamond/${diamond.stockNumber}`);
  };

  const handleContact = () => {
    impactOccurred('light');
    toast.success("Opening contact options...");
  };

  const isAvailable = diamond.status === "Available";

  // Calculate rotation based on device tilt for diamond image
  const imageTransform = diamond.imageUrl && !imageError 
    ? `perspective(1000px) rotateX(${orientationData.beta * 0.2}deg) rotateY(${orientationData.gamma * 0.2}deg)`
    : undefined;

  return (
    <div 
      id={`diamond-${diamond.stockNumber}`} 
      className="group relative bg-card rounded-2xl overflow-hidden transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {diamond.imageUrl && !imageError ? (
          <img 
            src={diamond.imageUrl} 
            alt={`${diamond.carat} ct ${diamond.shape} Diamond`} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            style={{ transform: imageTransform }}
            onError={() => setImageError(true)} 
            loading="lazy" 
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted-foreground/10">
            <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-muted-foreground/40 rounded-full"></div>
            </div>
          </div>
        )}
        
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
          disabled={wishlistLoading}
          className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-background/90 hover:scale-110 disabled:opacity-50"
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
            ${diamond.price?.toLocaleString() || 'N/A'}
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-10 border-border text-foreground hover:bg-muted"
            onClick={handleContact}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Contact
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
