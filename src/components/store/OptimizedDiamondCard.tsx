import { useState, memo, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Eye, MessageCircle, Gem, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";
import { toast } from 'sonner';
import { Gem360Viewer } from "./Gem360Viewer";
import { V360Viewer } from "./V360Viewer";
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Track share clicks when user comes from shared link
  useEffect(() => {
    const isShared = searchParams.get('shared');
    const sharedFrom = searchParams.get('from');
    
    if (isShared && sharedFrom) {
      trackShareClick(diamond.stockNumber, parseInt(sharedFrom));
    }
  }, [searchParams, diamond.stockNumber, trackShareClick]);

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

  // PHASE 1: Enhanced image URL validation with more flexible detection
  const hasValidImage = !!(
    diamond.imageUrl && 
    diamond.imageUrl.trim() && 
    diamond.imageUrl !== 'default' &&
    diamond.imageUrl.startsWith('http') &&
    diamond.imageUrl.length > 10 &&
    (diamond.imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) ||
     diamond.imageUrl.includes('placeholder') ||
     diamond.imageUrl.includes('unsplash') ||
     diamond.imageUrl.includes('/image') ||
     diamond.imageUrl.includes('w=') ||
     diamond.imageUrl.includes('h='))
  );

  // Enhanced 360° detection - prioritize interactive viewers over static images
  const has360 = !!(diamond.gem360Url && diamond.gem360Url.trim() && (
    diamond.gem360Url.includes('v360.in') ||         // Interactive viewers (highest priority)
    diamond.gem360Url.includes('diamondview.aspx') ||
    diamond.gem360Url.includes('my360.sela') ||      // 360° platforms
    diamond.gem360Url.includes('gem360') ||
    diamond.gem360Url.includes('sarine') ||
    diamond.gem360Url.includes('360') ||
    diamond.gem360Url.includes('.html') ||
    diamond.gem360Url.match(/DAN\d+-\d+[A-Z]?\.jpg$/i) // Static 360° images (lower priority)
  ));

  // Determine if it's v360.in specifically (highest priority)
  const isV360 = !!(diamond.gem360Url && diamond.gem360Url.includes('v360.in'));
  
  // Determine if it's an interactive 360° viewer (higher priority)
  const isInteractive360 = !!(diamond.gem360Url && (
    diamond.gem360Url.includes('v360.in') ||
    diamond.gem360Url.includes('diamondview.aspx') ||
    diamond.gem360Url.includes('.html') ||
    diamond.gem360Url.includes('sarine')
  ));

  // Enhanced fancy color detection with color_type support
  const colorInfo = detectFancyColor(diamond.color, diamond.color_type);
  const formattedColorDescription = formatFancyColorDescription(colorInfo);

  // Determine what attributes to show based on diamond type and color_type
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

  // Updated secure share function using inline buttons
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
      {/* PRIORITY 1: Always show 360° if available, prioritizing v360.in */}
      {has360 && isVisible ? (
        <div className="relative aspect-square">
          {isV360 ? (
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
        </div>
      ) : hasValidImage && isVisible ? (
        /* PRIORITY 2: Show actual diamond image only if no 360° available */
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
          
          {/* Image media badge */}
          <div className="absolute top-2 left-2">
            <MediaPriorityBadge hasGem360={false} hasImage={true} />
          </div>
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
                <FancyColorBadge colorInfo={colorInfo} />
                {diamond.clarity && (
                  <span className="bg-gray-200 px-2 py-1 rounded">{diamond.clarity}</span>
                )}
              </div>
              {showCutGrade && (
                <p className="text-xs text-yellow-600 font-medium">{diamond.cut}</p>
              )}
            </div>
            
            {/* Info-only media badge */}
            <div className="absolute top-2 left-2">
              <MediaPriorityBadge hasGem360={false} hasImage={false} />
            </div>
          </div>
        </div>
      )}
      
      {/* Status Badge */}
      <div className="absolute top-2 right-2">
        <Badge className="text-xs font-medium border-0 bg-green-500 text-white px-2 py-0.5">
          Available
        </Badge>
      </div>

      {/* Action Icons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleShare}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200 hover:bg-white hover:scale-110"
          disabled={!shareAvailable}
        >
          <Share2 className={`h-3 w-3 ${shareAvailable ? 'text-blue-600' : 'text-gray-400'}`} />
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

        {/* Enhanced Badge Section - Different logic for Fancy vs Standard */}
        <div className="flex flex-col gap-2 mb-3">
          {isFancyColor ? (
            /* FANCY COLOR DIAMOND DISPLAY */
            <>
              {/* Primary Color Badge for Fancy Colors */}
              <div className="flex items-center gap-1.5">
                <FancyColorBadge colorInfo={colorInfo} />
              </div>

              {/* Secondary Badges Row for Fancy Colors */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Certification Badge */}
                <CertificationBadge 
                  lab={diamond.lab} 
                  certificateUrl={diamond.certificateUrl}
                />
                
                {/* Origin Badge */}
                <OriginBadge 
                  isNatural={true} // Assume natural unless specified otherwise
                />

                {/* Optional Clarity for Fancy Colors (if available) */}
                {diamond.clarity && (
                  <Badge className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {diamond.clarity}
                  </Badge>
                )}
              </div>

              {/* Polish/Symmetry or Cut Grade for Round Brilliants only */}
              {showCutGrade ? (
                <div className="text-xs font-medium text-yellow-600">
                  Cut: {diamond.cut}
                </div>
              ) : polishSymmetryText ? (
                <div className="text-xs text-gray-500">
                  {polishSymmetryText}
                </div>
              ) : null}
            </>
          ) : (
            /* STANDARD WHITE DIAMOND DISPLAY */
            <>
              {/* Primary Row - Color and Clarity */}
              <div className="flex items-center gap-1.5">
                <Badge className="text-xs font-medium bg-blue-100 text-blue-800 border-blue-300 px-2 py-1 rounded">
                  {diamond.color}
                </Badge>
                
                {diamond.clarity && (
                  <Badge className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {diamond.clarity}
                  </Badge>
                )}
              </div>

              {/* Secondary Badges Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Certification Badge */}
                <CertificationBadge 
                  lab={diamond.lab} 
                  certificateUrl={diamond.certificateUrl}
                />
                
                {/* Origin Badge */}
                <OriginBadge 
                  isNatural={true}
                />
              </div>

              {/* Cut Grade for Standard Diamonds */}
              {showCutGrade && (
                <div className="text-xs font-medium text-yellow-600">
                  Cut: {diamond.cut}
                </div>
              )}
            </>
          )}
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
