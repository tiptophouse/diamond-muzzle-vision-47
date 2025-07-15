import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Share, Zap, Award, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { AdminStoreControls } from "./AdminStoreControls";
import { Gem360Viewer } from "./Gem360Viewer";
import { toast } from "sonner";

const ADMIN_TELEGRAM_ID = 2138564172;

interface EnhancedDiamondCardProps {
  diamond: Diamond;
  onUpdate?: () => void;
}

export function EnhancedDiamondCard({ diamond, onUpdate }: EnhancedDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isTelegramEnvironment } = useTelegramAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID && isTelegramEnvironment;

  // Enhanced Gem360 URL detection
  const getGem360Url = () => {
    const sources = [diamond.gem360Url, diamond.certificateUrl, diamond.imageUrl];
    for (const url of sources) {
      if (url && url.includes('gem360')) {
        return url;
      }
    }
    return null;
  };

  const gem360Url = getGem360Url();
  const hasGem360View = !!gem360Url;

  // Priority: show actual diamond image from CSV, then fallback
  const diamondImageUrl = diamond.imageUrl && !diamond.imageUrl.includes('gem360')
    ? diamond.imageUrl 
    : `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop&crop=center`;

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Inquiry sent! We'll contact you shortly.");
    } catch (error) {
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareUrl = `https://miniapp.mazalbot.com/store?stock=${diamond.stockNumber}`;
    const shareText = `✨ ${diamond.shape} Diamond ✨\n💎 ${diamond.carat}ct | ${diamond.color} | ${diamond.clarity}\n💰 $${diamond.price.toLocaleString()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${diamond.carat}ct ${diamond.shape} Diamond`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200/50 hover:border-purple-200">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 mb-2">
            ADMIN
          </Badge>
          <AdminStoreControls 
            diamond={diamond}
            onUpdate={onUpdate || (() => {})}
            onDelete={() => onUpdate?.()}
          />
        </div>
      )}

      {/* Premium Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {diamond.lab === 'GIA' && (
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-2 py-1 shadow-lg">
            <BadgeCheck className="w-3 h-3 mr-1" />
            GIA
          </Badge>
        )}
        {hasGem360View && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 shadow-lg">
            <Zap className="w-3 h-3 mr-1" />
            360°
          </Badge>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {hasGem360View ? (
          <Gem360Viewer gem360Url={gem360Url!} stockNumber={diamond.stockNumber} isInline={true} />
        ) : (
          <>
            {!imageError ? (
              <img
                src={diamondImageUrl}
                alt={`${diamond.shape} Diamond`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            {diamond.carat}ct {diamond.shape}
          </h3>
          <p className="text-sm text-slate-600">
            {diamond.color}-{diamond.clarity} | {diamond.cut} Cut
          </p>
        </div>

        <div className="text-2xl font-bold text-slate-900">
          ${diamond.price.toLocaleString()}
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100">
          <div className="text-center">
            <div className="text-xs text-slate-500">Carat</div>
            <div className="font-bold text-purple-700">{diamond.carat}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Cut</div>
            <div className="font-bold text-purple-700">{diamond.cut}</div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Inquire Now
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="text-xs text-slate-500 text-center pt-3 border-t border-slate-100">
          Stock #{diamond.stockNumber}
        </div>
      </div>
    </div>
  );
}