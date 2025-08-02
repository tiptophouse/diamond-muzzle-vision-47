import { useState, memo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, MessageCircle, Gem, Share2, Sparkles } from "lucide-react";
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

  // Enhanced intersection observer for better lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1 
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Enhanced image URL validation
  const hasValidImage = !!(
    diamond.imageUrl && 
    diamond.imageUrl.trim() && 
    diamond.imageUrl !== 'default' &&
    diamond.imageUrl.startsWith('http') &&
    diamond.imageUrl.length > 10 &&
    diamond.imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)
  );

  // Enhanced 360° detection with better validation
  const has360 = !!(diamond.gem360Url && diamond.gem360Url.trim() && (
    diamond.gem360Url.includes('my360.sela') ||
    diamond.gem360Url.includes('v360.in') ||
    diamond.gem360Url.includes('diamondview.aspx') ||
    diamond.gem360Url.includes('gem360') ||
    diamond.gem360Url.includes('360') ||
    diamond.gem360Url.includes('sarine') ||
    diamond.gem360Url.includes('.html') ||
    diamond.gem360Url.match(/DAN\d+-\d+[A-Z]?\.jpg$/i)
  ));

  // Debug logging
  useEffect(() => {
    console.log('🔍 DIAMOND CARD DEBUG:', {
      stockNumber: diamond.stockNumber,
      hasValidImage,
      imageUrl: diamond.imageUrl,
      has360,
      gem360Url: diamond.gem360Url
    });
  }, [diamond.stockNumber, hasValidImage, diamond.imageUrl, has360, diamond.gem360Url]);

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
    console.error('❌ IMAGE FAILED for', diamond.stockNumber, ':', event.currentTarget.src);
    setImageError(true);
    setImageLoaded(true);
  }, [diamond.stockNumber]);

  const priceDisplay = diamond.price > 0 ? formatCurrency(diamond.price) : null;

  return (
    <div 
      ref={cardRef}
      id={`diamond-${diamond.stockNumber}`} 
      className="group relative bg-white rounded-xl overflow-hidden transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-lg"
      style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
    >
      {/* PRIORITY 1: Always show 360° if available */}
      {has360 && isVisible ? (
        <div className="relative aspect-square">
          <Gem360Viewer 
            gem360Url={diamond.gem360Url!}
            stockNumber={diamond.stockNumber}
            isInline={true}
          />
          <div className="absolute top-2 left-2">
            <Badge className="text-xs font-medium border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm px-2 py-0.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              360°
            </Badge>
          </div>
        </div>
      ) : hasValidImage && isVisible ? (
        /* PRIORITY 2: Show actual diamond image */
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {/* Loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <img 
            ref={imgRef}
            src={diamond.imageUrl} 
            alt={`${diamond.carat} ct ${diamond.shape} Diamond`} 
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              imageRendering: 'crisp-edges',
              transform: 'translateZ(0)'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        /* PRIORITY 3: Enhanced info card when no media available */
        <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gem className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{diamond.carat} ct</h3>
              <p className="text-sm text-gray-600">{diamond.shape}</p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="bg-gray-200 px-2 py-1 rounded">{diamond.color}</span>
                <span className="bg-gray-200 px-2 py-1 rounded">{diamond.clarity}</span>
              </div>
              <p className="text-xs text-yellow-600 font-medium">{diamond.cut}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Status and Action Icons */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {/* Available Badge */}
        <Badge className="text-xs font-medium border-0 bg-green-500 text-white px-2 py-0.5">
          Available
        </Badge>
      </div>

      {/* Action Icons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleShare}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200 hover:bg-white hover:scale-110"
        >
          <Share2 className="h-3 w-3 text-gray-600" />
        </button>
        <button
          onClick={handleLike}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200 hover:bg-white hover:scale-110"
        >
          <Heart 
            className={`h-3 w-3 transition-colors ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
            }`} 
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {diamond.carat} ct {diamond.shape}
            </h3>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {diamond.stockNumber}
            </p>
          </div>
          <div className="ml-3 text-right">
            {priceDisplay ? (
              <p className="text-sm font-bold text-gray-900">
                {priceDisplay}
              </p>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Contact for Price
              </p>
            )}
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
            {diamond.color}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
            {diamond.clarity}
          </span>
          <span className="text-xs font-medium text-yellow-600">
            {diamond.cut}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={handleContact}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Contact
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
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
