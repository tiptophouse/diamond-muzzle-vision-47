import { useState } from "react";
import { Heart, Eye, Share, Edit, Upload, Sparkles, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { AdminStoreControls } from "./AdminStoreControls";
import { Gem360Viewer } from "./Gem360Viewer";
import { LuxuryDiamondModal } from "./LuxuryDiamondModal";

const ADMIN_TELEGRAM_ID = 2138564172;

interface ProfessionalDiamondCardProps {
  diamond: Diamond;
  onUpdate?: () => void;
}

export function ProfessionalDiamondCard({ diamond, onUpdate }: ProfessionalDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user, isTelegramEnvironment } = useTelegramAuth();
  
  // Only show admin controls if:
  // 1. User is authenticated through Telegram
  // 2. User ID matches the admin ID
  // 3. We're in a Telegram environment (for security)
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID && isTelegramEnvironment;

  console.log('👤 Current user ID:', user?.id);
  console.log('🔐 Admin ID:', ADMIN_TELEGRAM_ID);
  console.log('📱 Telegram Environment:', isTelegramEnvironment);
  console.log('👑 Is Admin:', isAdmin);

  // Enhanced Gem360 URL detection - check all possible sources
  const getGem360Url = () => {
    // Priority order: dedicated gem360Url field, then certificateUrl, then imageUrl
    const sources = [
      diamond.gem360Url,
      diamond.certificateUrl,
      diamond.imageUrl
    ];

    for (const url of sources) {
      if (url && url.includes('gem360')) {
        console.log('🔍 Found Gem360 URL in source:', url);
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

  // Priority: show actual diamond image from CSV, then fallback
  const diamondImageUrl = diamond.imageUrl && !diamond.imageUrl.includes('gem360')
    ? diamond.imageUrl 
    : `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center`;

  const handleDelete = () => {
    // Trigger refetch of data
    if (onUpdate) onUpdate();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <LuxuryDiamondModal diamond={diamond}>
      <div className="luxury-diamond-card group relative">
        {/* Premium Badge */}
        <div className="absolute top-3 left-3 z-20">
          <div className="luxury-badge">
            <Award className="h-3 w-3 text-purple-600" />
            <span className="text-purple-800">Premium</span>
          </div>
        </div>

        {/* Admin Controls - Only show for verified admin in Telegram environment */}
        {isAdmin && (
          <>
            {/* Admin Badge */}
            <div className="absolute top-3 right-3 z-20">
              <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                ADMIN
              </Badge>
            </div>
            
            {/* Admin Controls Component */}
            <AdminStoreControls 
              diamond={diamond}
              onUpdate={onUpdate || (() => {})}
              onDelete={handleDelete}
            />
          </>
        )}

        {/* Image/3D Viewer Container */}
        <div className="luxury-image-container relative aspect-square overflow-hidden">
        {hasGem360View ? (
          // Show 3D Gem360 viewer
          <Gem360Viewer 
            gem360Url={gem360Url!}
            stockNumber={diamond.stockNumber}
            isInline={true}
          />
        ) : (
          // Show regular image
          <>
            {!imageError ? (
              <img
                src={diamondImageUrl}
                alt={`${diamond.shape} Diamond`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-purple-100">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            )}
          </>
        )}
        
          {/* Action Icons - only show for non-admin users and when not showing 3D viewer */}
          {!isAdmin && !hasGem360View && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                size="icon"
                variant="secondary"
                className={`w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-300 ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-600'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white text-gray-600 shadow-lg transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* GIA Badge - only show when not showing 3D viewer */}
          {!hasGem360View && (
            <div className="absolute bottom-4 left-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2 shadow-lg">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">GIA Certified</span>
              </div>
            </div>
          )}
      </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
            {diamond.carat} Carat {diamond.color}-{diamond.clarity} {diamond.shape} Diamond
          </h3>

          {/* Price */}
          <div className="luxury-price text-2xl font-bold">
            {formatPrice(diamond.price)}
          </div>

          {/* Quick Details - Horizontal Layout */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Carat</div>
              <div className="font-bold text-gray-900">{diamond.carat}</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Color</div>
              <div className="font-bold text-gray-900">{diamond.color}</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Clarity</div>
              <div className="font-bold text-gray-900">{diamond.clarity}</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-pink-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Cut</div>
              <div className="font-bold text-gray-900 text-xs">{diamond.cut.slice(0, 4)}</div>
            </div>
          </div>

          {/* Stock Number */}
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-3 flex items-center justify-between">
            <span>Stock #{diamond.stockNumber}</span>
            {hasGem360View && (
              <div className="flex items-center gap-1 text-purple-600">
                <Eye className="h-3 w-3" />
                <span className="text-xs font-medium">3D View</span>
              </div>
            )}
          </div>

          {/* Admin Info - only show for admin users */}
          {isAdmin && (
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              Admin: Click edit/delete buttons above to manage this diamond
            </div>
          )}

          {/* View Details Hint */}
          <div className="text-xs text-gray-400 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Click to view detailed information
          </div>
        </div>
      </div>
    </LuxuryDiamondModal>
  );
}
