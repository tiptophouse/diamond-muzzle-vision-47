
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, Share, Edit, Upload, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { AdminStoreControls } from "./AdminStoreControls";
import { Gem360Viewer } from "./Gem360Viewer";
import { V360Viewer } from "./V360Viewer";

const ADMIN_TELEGRAM_ID = 2138564172;

interface ProfessionalDiamondCardProps {
  diamond: Diamond;
  onUpdate?: () => void;
}

export function ProfessionalDiamondCard({ diamond, onUpdate }: ProfessionalDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user, isTelegramEnvironment } = useTelegramAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID && isTelegramEnvironment;

  // PRIORITY 1: Enhanced 360° detection - highest priority for 3D viewers
  const has360 = !!(diamond.gem360Url && diamond.gem360Url.trim() && (
    diamond.gem360Url.includes('v360.in') ||
    diamond.gem360Url.includes('diamondview.aspx') ||
    diamond.gem360Url.includes('my360.sela') ||
    diamond.gem360Url.includes('gem360') ||
    diamond.gem360Url.includes('sarine') ||
    diamond.gem360Url.includes('360') ||
    diamond.gem360Url.includes('.html') ||
    diamond.gem360Url.match(/DAN\d+-\d+[A-Z]?\.jpg$/i)
  ));

  // PRIORITY 2: Enhanced image validation - only for actual diamond photos
  const hasValidImage = !!(
    diamond.imageUrl && 
    diamond.imageUrl.trim() && 
    diamond.imageUrl !== 'default' &&
    diamond.imageUrl.startsWith('http') &&
    diamond.imageUrl.length > 10 &&
    diamond.imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) &&
    !diamond.imageUrl.includes('.html') &&
    !diamond.imageUrl.includes('diamondview.aspx') &&
    !diamond.imageUrl.includes('v360.in') &&
    !diamond.imageUrl.includes('sarine')
  );

  const isV360 = !!(diamond.gem360Url && diamond.gem360Url.includes('v360.in'));

  console.log('🔍 Professional Card Media Check:', diamond.stockNumber);
  console.log('🔍 has360:', has360);
  console.log('🔍 hasValidImage:', hasValidImage);
  console.log('🔍 gem360Url:', diamond.gem360Url);
  console.log('🔍 imageUrl:', diamond.imageUrl);

  const handleDelete = () => {
    if (onUpdate) onUpdate();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Build URL with diamond parameters
    const params = new URLSearchParams({
      carat: diamond.carat.toString(),
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      shape: diamond.shape,
      stock: diamond.stockNumber,
      price: diamond.price.toString(),
    });

    // Add optional parameters if they exist
    if (diamond.fluorescence) params.set('fluorescence', diamond.fluorescence);
    if (diamond.imageUrl) params.set('imageUrl', diamond.imageUrl);
    if (diamond.certificateUrl) params.set('certificateUrl', diamond.certificateUrl);
    if (diamond.lab) params.set('lab', diamond.lab);
    if (diamond.certificateNumber) params.set('certificateNumber', diamond.certificateNumber);
    
    const shareUrl = `https://miniapp.mazalbot.com/store?${params.toString()}`;
    const shareTitle = `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond`;
    const shareText = `Check out this beautiful ${diamond.shape} diamond! ${diamond.carat}ct, ${diamond.color} color, ${diamond.clarity} clarity. Price: $${diamond.price.toLocaleString()}`;
    
    console.log('🔗 Share URL:', shareUrl);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
      {/* Admin Controls - Only show for verified admin in Telegram environment */}
      {isAdmin && (
        <>
          {/* Admin Badge */}
          <div className="absolute top-2 left-2 z-20">
            <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
              ADMIN
            </Badge>
          </div>
          
          {/* Admin Controls Component */}
          <div className="admin-controls">
            <AdminStoreControls 
              diamond={diamond}
              onUpdate={onUpdate || (() => {})}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      {/* Media Container with Priority System */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* PRIORITY 1: 3D/360° viewer (highest priority) */}
        {has360 ? (
          <div className="w-full h-full">
            {console.log(`✨ PROFESSIONAL: SHOWING 3D VIEWER for ${diamond.stockNumber}`)}
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
          </div>
        ) : hasValidImage ? (
          /* PRIORITY 2: Show regular diamond image */
          <div className="w-full h-full">
            {console.log(`📸 PROFESSIONAL: SHOWING IMAGE for ${diamond.stockNumber}`)}
            {!imageError ? (
              <img
                src={diamond.imageUrl}
                alt={`${diamond.shape} Diamond`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Gem className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">Image Error</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* PRIORITY 3: Info card when no media available */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            {console.log(`ℹ️ PROFESSIONAL: SHOWING INFO CARD for ${diamond.stockNumber}`)}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gem className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{diamond.carat} ct</h3>
                <p className="text-sm text-gray-600">{diamond.shape}</p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{diamond.color}</span>
                  <span className="bg-gray-200 px-2 py-1 rounded">{diamond.clarity}</span>
                </div>
                <p className="text-xs text-yellow-600 font-medium">{diamond.cut}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Share Button - Always visible in bottom-right with fixed styling */}
        <div className="absolute bottom-3 right-3 opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-sm border-0 p-2 touch-target"
            onClick={handleShare}
            title="Share this diamond"
            aria-label="Share this diamond"
          >
            <Share className="h-4 w-4 flex-shrink-0" />
          </Button>
        </div>

        {/* GIA Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="text-xs font-medium text-gray-900">GIA</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          GIA {diamond.carat} Carat {diamond.color}-{diamond.clarity} {diamond.cut} Cut {diamond.shape} Diamond
        </h3>

        {/* Price */}
        <div className="text-lg font-bold text-gray-900">
          ${diamond.price.toLocaleString()}
        </div>

        {/* Quick Details - Horizontal Layout */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500">Carat</div>
            <div className="font-medium">{diamond.carat}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Color</div>
            <div className="font-medium">{diamond.color}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Clarity</div>
            <div className="font-medium">{diamond.clarity}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Cut</div>
            <div className="font-medium text-xs">{diamond.cut.slice(0, 4)}</div>
          </div>
        </div>

        {/* Stock Number */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Stock #{diamond.stockNumber}
        </div>

        {/* Media Status Badge */}
        {has360 && (
          <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            ✨ Interactive 3D view available above
          </div>
        )}

        {/* Admin Info - only show for admin users */}
        {isAdmin && (
          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Admin: Click edit/delete buttons above to manage this diamond
          </div>
        )}
      </div>
    </div>
  );
}
