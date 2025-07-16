import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, Share, Edit, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { AdminStoreControls } from "./AdminStoreControls";
import { Gem360Viewer } from "./Gem360Viewer";

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
  
  // Only show admin controls if:
  // 1. User is authenticated through Telegram
  // 2. User ID matches the admin ID
  // 3. We're in a Telegram environment (for security)
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID && isTelegramEnvironment;

  console.log('👤 Current user ID:', user?.id);
  console.log('🔐 Admin ID:', ADMIN_TELEGRAM_ID);
  console.log('📱 Telegram Environment:', isTelegramEnvironment);
  console.log('👑 Is Admin:', isAdmin);

  // Enhanced 3D URL detection - check for both gem360 and diamondview.aspx URLs
  const getGem360Url = () => {
    // Priority order: dedicated gem360Url field, then certificateUrl, then imageUrl
    const sources = [
      diamond.gem360Url,
      diamond.certificateUrl,
      diamond.imageUrl
    ];

    for (const url of sources) {
      if (url && (url.includes('gem360') || url.includes('diamondview.aspx'))) {
        console.log('🔍 Found 3D viewer URL in source:', url);
        return url;
      }
    }

    return null;
  };

  const gem360Url = getGem360Url();
  const hasGem360View = !!gem360Url;

  console.log('🔍 Diamond:', diamond.stockNumber);
  console.log('🔍 gem360Url field:', diamond.gem360Url);
  console.log('🔍 certificateUrl field:', diamond.certificateUrl);
  console.log('🔍 imageUrl field:', diamond.imageUrl);
  console.log('🔍 Final gem360Url:', gem360Url);
  console.log('🔍 hasGem360View:', hasGem360View);

  // Use actual diamond image from CSV data, excluding 3D viewer URLs
  const diamondImageUrl = diamond.imageUrl && 
    !diamond.imageUrl.includes('gem360') &&
    !diamond.imageUrl.includes('diamondview.aspx')
    ? diamond.imageUrl 
    : null;

  const handleDelete = () => {
    // Trigger refetch of data
    if (onUpdate) onUpdate();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
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

      {/* Image/3D Viewer Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {hasGem360View ? (
          // Show 3D Gem360 viewer
          <Gem360Viewer 
            gem360Url={gem360Url!}
            stockNumber={diamond.stockNumber}
            isInline={true}
          />
        ) : (
          // Show regular image or diamond placeholder
          <>
            {diamondImageUrl && !imageError ? (
              <img
                src={diamondImageUrl}
                alt={`${diamond.shape} Diamond`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💎</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Share Button - Always visible in bottom-right */}
        <div className="absolute bottom-3 right-3 opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-sm"
            onClick={handleShare}
            title="Share this diamond"
          >
            <Share className="h-4 w-4" />
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

        {/* Enhanced Details Grid */}
        <div className="space-y-3">
          {/* Primary 4C's */}
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
              <div className="font-medium text-xs">{diamond.cut}</div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded">
            {diamond.fluorescence && (
              <div className="flex justify-between">
                <span className="text-gray-500">Fluorescence:</span>
                <span className="font-medium">{diamond.fluorescence}</span>
              </div>
            )}
            {diamond.polish && (
              <div className="flex justify-between">
                <span className="text-gray-500">Polish:</span>
                <span className="font-medium">{diamond.polish}</span>
              </div>
            )}
            {diamond.symmetry && (
              <div className="flex justify-between">
                <span className="text-gray-500">Symmetry:</span>
                <span className="font-medium">{diamond.symmetry}</span>
              </div>
            )}
            {diamond.tablePercentage && (
              <div className="flex justify-between">
                <span className="text-gray-500">Table:</span>
                <span className="font-medium">{diamond.tablePercentage}%</span>
              </div>
            )}
            {diamond.depthPercentage && (
              <div className="flex justify-between">
                <span className="text-gray-500">Depth:</span>
                <span className="font-medium">{diamond.depthPercentage}%</span>
              </div>
            )}
            {diamond.certificateNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">Certificate:</span>
                <span className="font-medium">{diamond.certificateNumber}</span>
              </div>
            )}
          </div>

          {/* Measurements */}
          {(diamond.length || diamond.width || diamond.depth) && (
            <div className="text-xs bg-blue-50 p-2 rounded">
              <div className="text-gray-500 mb-1">Measurements:</div>
              <div className="font-medium">
                {diamond.length && diamond.width && diamond.depth
                  ? `${diamond.length} × ${diamond.width} × ${diamond.depth} mm`
                  : diamond.length && diamond.width
                  ? `${diamond.length} × ${diamond.width} mm`
                  : 'Available on request'}
              </div>
            </div>
          )}
        </div>

        {/* Stock Number */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Stock #{diamond.stockNumber}
        </div>

        {/* 3D View Badge */}
        {hasGem360View && (
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
