import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Heart, Share2, Eye, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { SecureShareButton } from "./SecureShareButton";
import { toast } from "@/hooks/use-toast";
interface ModernDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
}
export function ModernDiamondCard({
  diamond,
  index,
  onUpdate
}: ModernDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const {
    user
  } = useTelegramAuth();
  const {
    impactOccurred
  } = useTelegramHapticFeedback();
  const navigate = useNavigate();
  const handleContactOwner = () => {
    impactOccurred('medium');
    const message = `Hi! I'm interested in your diamond:\n\n` + `Stock #: ${diamond.stockNumber}\n` + `Shape: ${diamond.shape}\n` + `Carat: ${diamond.carat}\n` + `Color: ${diamond.color}\n` + `Clarity: ${diamond.clarity}\n` + `Price: $${diamond.price?.toLocaleString() || 'N/A'}\n\n` + `Could you please provide more details?`;
    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=${encodedMessage}`;
    try {
      window.open(telegramUrl, '_blank');
      toast({
        title: "Opening Telegram",
        description: "Redirecting to Telegram to contact the owner."
      });
    } catch (error) {
      console.error('Failed to open Telegram:', error);
      toast({
        title: "Error",
        description: "Failed to open Telegram. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleLike = () => {
    impactOccurred('light');
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `Diamond ${diamond.stockNumber} ${isLiked ? 'removed from' : 'added to'} your favorites.`
    });
  };
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    impactOccurred('light');
    const shareUrl = `${window.location.origin}/store?stockNumber=${diamond.stockNumber}&carat=${diamond.carat}&color=${diamond.color}&clarity=${diamond.clarity}&shape=${diamond.shape}`;
    const shareText = `Check out this ${diamond.carat} ct ${diamond.shape} diamond - ${diamond.color} color, ${diamond.clarity} clarity. Price: $${diamond.price?.toLocaleString() || 'N/A'}`;
    try {
      // Try native share first
      if (navigator.share) {
        await navigator.share({
          title: `${diamond.carat} ct ${diamond.shape} Diamond`,
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Diamond link has been copied to your clipboard."
        });
      }
    } catch (error) {
      // If share was cancelled or failed, copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Diamond link has been copied to your clipboard."
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy link.",
          variant: "destructive"
        });
      }
    }
  };
  const handleViewDetails = () => {
    impactOccurred('light');
    // Navigate to diamond details page within the app
    navigate(`/diamond/${diamond.stockNumber}`);
    toast({
      title: "Opening Diamond Details",
      description: `Viewing details for diamond #${diamond.stockNumber}`
    });
  };
  return <Card id={`diamond-${diamond.stockNumber}`} className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg bg-white" style={{
    animationDelay: `${index * 50}ms`,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  }}>
      {/* Enhanced Image Container with better fallback */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {diamond.imageUrl && !imageError ? <img src={diamond.imageUrl} alt={`${diamond.carat} ct ${diamond.shape} Diamond`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImageError(true)} loading="lazy" /> : (/* Enhanced fallback with professional diamond imagery */
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
            
            <div className="relative z-10">
              
              <div className="mt-2 text-center">
                
              </div>
            </div>
          </div>)}
        
        {/* Enhanced Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-3">
            <Button size="sm" variant="secondary" className="bg-white/95 hover:bg-white border-0 shadow-xl backdrop-blur-sm" onClick={handleLike}>
              <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/95 hover:bg-white border-0 shadow-xl backdrop-blur-sm" onClick={handleViewDetails}>
              <Eye className="h-4 w-4 text-gray-600" />
            </Button>
            <SecureShareButton stockNumber={diamond.stockNumber} diamond={{
            carat: diamond.carat,
            shape: diamond.shape,
            color: diamond.color,
            clarity: diamond.clarity,
            price: diamond.price || 0
          }} variant="outline" size="sm" className="bg-white/95 hover:bg-white border-0 shadow-xl backdrop-blur-sm" />
          </div>
        </div>
        
        {/* Enhanced Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`px-3 py-1.5 text-xs font-semibold border-0 shadow-lg backdrop-blur-sm ${diamond.status === "Available" ? "bg-green-500/90 text-white hover:bg-green-600" : "bg-blue-500/90 text-white hover:bg-blue-600"}`}>
            {diamond.status || "Available"}
          </Badge>
        </div>

        {/* Enhanced Premium Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            ✨ Premium
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Enhanced Header with Price */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            #{diamond.stockNumber}
          </span>
          <span className="text-2xl font-bold text-slate-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ${diamond.price?.toLocaleString() || 'N/A'}
          </span>
        </div>

        {/* Enhanced Diamond Details */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xl leading-tight">
            {diamond.carat} ct {diamond.shape}
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-slate-50 rounded-lg py-2">
              <p className="text-xs text-slate-500 mb-1 font-medium">Color</p>
              <Badge variant="outline" className="text-sm bg-white border-slate-300 font-semibold">
                {diamond.color}
              </Badge>
            </div>
            <div className="text-center bg-slate-50 rounded-lg py-2">
              <p className="text-xs text-slate-500 mb-1 font-medium">Clarity</p>
              <Badge variant="outline" className="text-sm bg-white border-slate-300 font-semibold">
                {diamond.clarity}
              </Badge>
            </div>
            <div className="text-center bg-slate-50 rounded-lg py-2">
              <p className="text-xs text-slate-500 mb-1 font-medium">Cut</p>
              <Badge variant="outline" className="text-sm bg-white border-slate-300 font-semibold">
                {diamond.cut || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleContactOwner} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 font-semibold" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Owner
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleViewDetails} className="px-4 bg-white hover:bg-slate-50 border-slate-300 hover:border-blue-400 h-12 font-semibold hover:text-blue-600 transition-all duration-300">
            <Eye className="h-4 w-4 mr-2" />
            <span>View Details</span>
          </Button>
        </div>
      </CardContent>
    </Card>;
}