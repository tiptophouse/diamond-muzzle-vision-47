
import { useState } from "react";
import { Heart, Eye, Share, MessageCircle, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { AdminStoreControls } from "./AdminStoreControls";
import { ContactBuyerModal } from "./ContactBuyerModal";
import { Gem360Viewer } from "./Gem360Viewer";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

interface ModernDiamondCardProps {
  diamond: Diamond;
  onUpdate?: () => void;
  storeOwnerId?: number;
}

export function ModernDiamondCard({ diamond, onUpdate, storeOwnerId }: ModernDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useTelegramAuth();
  const { isSubscribed } = useSubscriptionStatus();
  
  // Check if current user is the store admin (owner)
  const isStoreAdmin = user?.id === storeOwnerId && isSubscribed;
  
  // Enhanced Gem360 URL detection
  const getGem360Url = () => {
    const sources = [diamond.gem360Url, diamond.certificateUrl, diamond.imageUrl];
    return sources.find(url => url && url.includes('gem360')) || null;
  };

  const gem360Url = getGem360Url();
  const hasGem360View = !!gem360Url;

  // Fallback diamond image
  const diamondImageUrl = !hasGem360View && diamond.imageUrl && !diamond.imageUrl.includes('gem360') 
    ? diamond.imageUrl 
    : `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&crop=center`;

  const handleShare = () => {
    const shareData = {
      title: `${diamond.carat} Carat ${diamond.shape} Diamond`,
      text: `Check out this ${diamond.carat} carat ${diamond.color}-${diamond.clarity} ${diamond.shape} diamond for $${diamond.price.toLocaleString()}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
        {/* Admin Controls - Only for store owners with active subscription */}
        {isStoreAdmin && onUpdate && (
          <>
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full">
                ADMIN
              </Badge>
            </div>
            <AdminStoreControls 
              diamond={diamond}
              onUpdate={onUpdate}
              onDelete={() => onUpdate?.()}
            />
          </>
        )}

        {/* Image/3D Viewer Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {hasGem360View ? (
            <Gem360Viewer 
              gem360Url={gem360Url!}
              stockNumber={diamond.stockNumber}
              isInline={true}
            />
          ) : (
            <>
              {!imageError ? (
                <img
                  src={diamondImageUrl}
                  alt={`${diamond.shape} Diamond`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Action Icons Overlay */}
          {!isStoreAdmin && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="secondary"
                className={`w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white text-gray-600 shadow-lg"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Info className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white text-gray-600 shadow-lg"
                onClick={handleShare}
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-lg">
              ${diamond.price.toLocaleString()}
            </Badge>
          </div>

          {/* 3D Badge */}
          {hasGem360View && (
            <div className="absolute bottom-4 right-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 text-xs rounded-full shadow-lg">
                360° VIEW
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {diamond.carat} Carat {diamond.shape} Diamond
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {diamond.color}-{diamond.clarity} • {diamond.cut} Cut
            </p>
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-4 gap-3 py-3 bg-gray-50 rounded-xl px-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Carat</div>
              <div className="font-bold text-sm">{diamond.carat}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Color</div>
              <div className="font-bold text-sm">{diamond.color}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Clarity</div>
              <div className="font-bold text-sm">{diamond.clarity}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Cut</div>
              <div className="font-bold text-sm">{diamond.cut.slice(0, 4)}</div>
            </div>
          </div>

          {/* Stock Number */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <span>Stock #{diamond.stockNumber}</span>
            {diamond.certificateNumber && (
              <span>GIA: {diamond.certificateNumber}</span>
            )}
          </div>

          {/* Contact Button - Only for non-admin users */}
          {!isStoreAdmin && (
            <Button 
              onClick={() => setShowContactModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Store Owner
            </Button>
          )}

          {/* Admin Info */}
          {isStoreAdmin && (
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              ✨ Admin View: Use the controls above to manage this diamond
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Modal */}
      <ContactBuyerModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        diamond={diamond}
        storeOwnerTelegramId={storeOwnerId}
      />
    </>
  );
}
