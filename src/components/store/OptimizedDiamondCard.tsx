import { useState, memo, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Eye, MessageCircle, Gem, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";
import { useEnhancedDiamondSharing } from "@/hooks/useEnhancedDiamondSharing";
import { LimitedGroupShareButton } from "./LimitedGroupShareButton";
import { P2PShareButton } from "./P2PShareButton";
import { toast } from 'sonner';
import { Gem360Viewer } from "./Gem360Viewer";
import { V360Viewer } from "./V360Viewer";
import { SegomaViewer } from "./SegomaViewer";
import { TelegramOptimizedImage } from "@/components/ui/TelegramOptimizedImage";
import { formatCurrency } from "@/utils/numberUtils";
import { 
  detectFancyColor, 
  formatFancyColorDescription,
  shouldShowCutGrade,
  formatPolishSymmetry 
} from "@/utils/fancyColorUtils";
import { FancyColorBadge, CertificationBadge, OriginBadge } from "./FancyColorBadge";
import { MediaPriorityBadge } from "./MediaPriorityBadge";

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
  const { shareWithInlineButtons, trackShareClick, isAvailable: shareAvailable } = useSecureDiamondSharing();
  const { shareToStory, hasStorySharing, isSharing: isStorySharing } = useEnhancedDiamondSharing();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const isShared = searchParams.get('shared');
    const sharedFrom = searchParams.get('from');
    
    if (isShared && sharedFrom) {
      trackShareClick(diamond.stockNumber, parseInt(sharedFrom));
    }
  }, [searchParams, diamond.stockNumber, trackShareClick]);

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

  const has360 = !!(diamond.gem360Url && diamond.gem360Url.trim() && (
    diamond.gem360Url.includes('my360.fab') ||     // Your specific provider (highest priority)
    diamond.gem360Url.includes('v360.in') ||       // Interactive viewers
    diamond.gem360Url.includes('diamondview.aspx') ||
    diamond.gem360Url.includes('my360.sela') ||    // 360° platforms
    diamond.gem360Url.includes('gem360') ||
    diamond.gem360Url.includes('sarine') ||
    diamond.gem360Url.includes('segoma.com') ||    // Segoma viewer
    diamond.gem360Url.includes('v.aspx') ||        // Segoma viewer pattern
    diamond.gem360Url.includes('type=view') ||     // Segoma viewer parameter
    diamond.gem360Url.includes('360') ||
    diamond.gem360Url.includes('.html') ||         // HTML viewers like your example
    diamond.gem360Url.match(/DAN\d+-\d+[A-Z]?\.jpg$/i) // Static 360° images
  ));

  const isV360 = !!(diamond.gem360Url && diamond.gem360Url.includes('v360.in'));
  const isMy360Fab = !!(diamond.gem360Url && diamond.gem360Url.includes('my360.fab'));
  // Detect Segoma URLs (format: https://segoma.com/v.aspx?type=view&id=X)
  const isSegoma = !!(diamond.gem360Url && (
    diamond.gem360Url.includes('segoma.com') || 
    diamond.gem360Url.includes('v.aspx')
  ));

  const hasValidImage = !!(
    diamond.imageUrl && 
    diamond.imageUrl.trim() && 
    diamond.imageUrl !== 'default' &&
    diamond.imageUrl !== 'null' &&
    diamond.imageUrl !== 'undefined' &&
    diamond.imageUrl.startsWith('http') &&
    diamond.imageUrl.length > 10 &&
    !diamond.imageUrl.includes('placeholder') &&
    !diamond.imageUrl.includes('mockup') &&
    // Exclude 360° URLs from regular images
    !diamond.imageUrl.includes('my360.fab') &&
    !diamond.imageUrl.includes('v360.in') &&
    !diamond.imageUrl.includes('segoma.com') &&
    !diamond.imageUrl.includes('.html') &&
    !diamond.imageUrl.includes('diamondview.aspx')
  );

  const colorInfo = detectFancyColor(diamond.color, diamond.color_type);
  const formattedColorDescription = formatFancyColorDescription(colorInfo);
  const isFancyColor = diamond.color_type === 'Fancy' || colorInfo.isFancyColor;
  const showCutGrade = shouldShowCutGrade(diamond.shape, diamond.cut, diamond.color_type);
  const polishSymmetryText = formatPolishSymmetry(diamond.polish, diamond.symmetry);

  const handleLike = useCallback(() => {
    impactOccurred('light');
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  }, [impactOccurred, isLiked]);

  const handleViewDetails = useCallback(() => {
    impactOccurred('light');
    navigate(`/diamond/${diamond.stockNumber}`);
  }, [impactOccurred, navigate, diamond.stockNumber]);

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

  const handleShare = useCallback(async () => {
    impactOccurred('medium');
    
    if (!shareAvailable) {
      toast.error('Secure sharing requires Telegram Mini App');
      return;
    }

    const success = await shareWithInlineButtons(diamond);
    if (success) {
      console.log('✅ Diamond shared securely with inline buttons');
    }
  }, [impactOccurred, shareAvailable, shareWithInlineButtons, diamond]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ IMAGE LOADED for', diamond.stockNumber);
    setImageLoaded(true);
    setImageError(false);
  }, [diamond.stockNumber]);

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ IMAGE FAILED for', diamond.stockNumber, ':', event.currentTarget.src);
    setImageError(true);
    setImageLoaded(false); // Keep loading false to show fallback properly
  }, [diamond.stockNumber]);

  const priceDisplay = diamond.price > 0 ? formatCurrency(diamond.price) : null;

  return (
    <div 
      ref={cardRef}
      id={`diamond-${diamond.stockNumber}`} 
      className="group relative bg-white rounded-xl overflow-hidden transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-lg"
      style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
    >
      {has360 && isVisible ? (
        <div className="relative aspect-square">
          {isSegoma ? (
            <SegomaViewer 
              segomaUrl={diamond.gem360Url!}
              stockNumber={diamond.stockNumber}
              isInline={true}
              className="w-full h-full"
            />
          ) : isV360 ? (
            <V360Viewer 
              v360Url={diamond.gem360Url!}
              stockNumber={diamond.stockNumber}
              isInline={true}
            />
          ) : (
            <Gem360Viewer 
              gem360Url={diamond.gem360Url!}
              stockNumber={diamond.stockNumber}
              isInline={true}
            />
          )}
          <div className="absolute top-2 left-2">
            <MediaPriorityBadge hasGem360={true} hasImage={false} />
          </div>
          {isSegoma && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-purple-500 text-white border-0 px-2 py-1 text-xs font-medium">
                Segoma
              </Badge>
            </div>
          )}
          {isMy360Fab && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-purple-500 text-white border-0 px-2 py-1 text-xs font-medium">
                my360.fab
              </Badge>
            </div>
          )}
        </div>
      ) : hasValidImage && isVisible ? (
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <TelegramOptimizedImage
            stockNumber={diamond.stockNumber}
            src={diamond.imageUrl}
            alt={`${diamond.carat} ct ${diamond.shape} Diamond`}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            priority={index < 6 ? 'high' : 'medium'}
            onLoad={handleImageLoad}
            onError={() => handleImageError({} as React.SyntheticEvent<HTMLImageElement>)}
          />
          
          <div className="absolute top-2 left-2 z-10">
            <MediaPriorityBadge hasGem360={false} hasImage={true} />
          </div>
        </div>
      ) : (
        <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gem className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{diamond.carat} ct</h3>
              <p className="text-sm text-gray-600">{diamond.shape}</p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <FancyColorBadge colorInfo={colorInfo} />
                {diamond.clarity && (
                  <span className="bg-gray-200 px-2 py-1 rounded">{diamond.clarity}</span>
                )}
              </div>
              {showCutGrade && (
                <p className="text-xs text-yellow-600 font-medium">{diamond.cut}</p>
              )}
            </div>
            
            <div className="absolute top-2 left-2">
              <MediaPriorityBadge hasGem360={false} hasImage={false} />
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute top-2 right-2">
        <Badge className="text-xs font-medium border-0 bg-green-500 text-white px-2 py-0.5">
          Available
        </Badge>
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

      {/* Telegram Best Practice: Clean info section matching reference design */}
      <div className="p-4 bg-white space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
              {diamond.carat} ct {diamond.shape}
            </h3>
            <p className="text-xs text-gray-500">
              Stock: {diamond.stockNumber}
            </p>
          </div>
          {priceDisplay && (
            <div className="ml-3 text-right">
              <p className="text-sm text-gray-500 mb-1">Contact</p>
            </div>
          )}
        </div>

        {/* Telegram Best Practice: Clean badge layout matching reference */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md">
            {diamond.color}
          </Badge>
          {diamond.clarity && (
            <Badge className="text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-md">
              {diamond.clarity}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CertificationBadge 
            lab={diamond.lab} 
            certificateUrl={diamond.certificateUrl}
          />
          <OriginBadge isNatural={true} />
        </div>

        {showCutGrade && (
          <div className="text-sm font-semibold text-amber-600">
            Cut: {diamond.cut}
          </div>
        )}

        {/* Telegram Best Practice: Large prominent CTA button (matches reference) */}
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="lg" 
            className="flex-1 h-12 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md rounded-xl"
            onClick={handleViewDetails}
          >
            <Eye className="h-5 w-5 mr-2" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-12 px-4 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm rounded-xl"
            onClick={handleContact}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Telegram Best Practice: Share buttons row (matches reference design) */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            className="flex-1 h-10 text-sm border-gray-200 hover:bg-gray-50 rounded-xl"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Bot
          </Button>
          <LimitedGroupShareButton 
            diamond={diamond} 
            size="default"
            className="flex-1 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-0 rounded-xl font-semibold"
          />
          <Button
            variant="outline"
            size="default"
            className="flex-1 h-10 text-sm border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50 rounded-xl"
            onClick={async () => {
              if (!hasStorySharing) {
                toast.error("Story sharing requires Telegram 7.2+", {
                  description: "Please update your Telegram app"
                });
                return;
              }
              
              impactOccurred('medium');
              
              const result = await shareToStory({
                id: diamond.id,
                stockNumber: diamond.stockNumber,
                carat: diamond.carat,
                shape: diamond.shape,
                color: diamond.color,
                clarity: diamond.clarity,
                cut: diamond.cut || '',
                price: diamond.price,
                imageUrl: diamond.imageUrl,
                gem360Url: diamond.gem360Url,
                picture: diamond.picture
              });
              
              if (!result) {
                toast.error("Story sharing failed");
              }
            }}
            disabled={isStorySharing || !hasStorySharing}
          >
            {isStorySharing ? (
              <div className="h-4 w-4 mr-1.5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="h-4 w-4 mr-1.5" />
            )}
            Story
          </Button>
        </div>
      </div>
    </div>
  );
});

OptimizedDiamondCard.displayName = 'OptimizedDiamondCard';

export { OptimizedDiamondCard };
