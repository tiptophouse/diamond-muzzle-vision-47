import { useState } from "react";
import { MessageCircle, Heart, Share2, Eye, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { toast } from "@/hooks/use-toast";

interface ModernDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
}

export function ModernDiamondCard({ diamond, index, onUpdate }: ModernDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useTelegramAuth();
  const { impactOccurred } = useTelegramHapticFeedback();

  const handleContactOwner = () => {
    impactOccurred('medium');
    
    const message = `Hi! I'm interested in your diamond:\n\n` +
      `Stock #: ${diamond.stockNumber}\n` +
      `Shape: ${diamond.shape}\n` +
      `Carat: ${diamond.carat}\n` +
      `Color: ${diamond.color}\n` +
      `Clarity: ${diamond.clarity}\n` +
      `Price: $${diamond.price?.toLocaleString() || 'N/A'}\n\n` +
      `Could you please provide more details?`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=${encodedMessage}`;
    
    try {
      window.open(telegramUrl, '_blank');
      toast({
        title: "Opening Telegram",
        description: "Redirecting to Telegram to contact the owner.",
      });
    } catch (error) {
      console.error('Failed to open Telegram:', error);
      toast({
        title: "Error",
        description: "Failed to open Telegram. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLike = () => {
    impactOccurred('light');
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `Diamond ${diamond.stockNumber} ${isLiked ? 'removed from' : 'added to'} your favorites.`,
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
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Diamond link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      // If share was cancelled or failed, copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Diamond link has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy link.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-sm bg-white"
      style={{ 
        animationDelay: `${index * 50}ms`,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {diamond.imageUrl && !imageError ? (
          <img
            src={diamond.imageUrl}
            alt={`${diamond.carat} ct ${diamond.shape} Diamond`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white border-0 shadow-lg"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white border-0 shadow-lg"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            className={`px-2 py-1 text-xs font-medium border-0 shadow-sm ${
              diamond.status === "Available" 
                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            {diamond.status || "Available"}
          </Badge>
        </div>

        {/* Premium Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg px-2 py-1 text-xs">
            Premium
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Header with Price */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            #{diamond.stockNumber}
          </span>
          <span className="text-xl font-bold text-slate-900">
            ${diamond.price?.toLocaleString() || 'N/A'}
          </span>
        </div>

        {/* Diamond Details */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 text-lg leading-tight">
            {diamond.carat} ct {diamond.shape}
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Color</p>
              <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200">
                {diamond.color}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Clarity</p>
              <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200">
                {diamond.clarity}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Cut</p>
              <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200">
                {diamond.cut || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleContactOwner}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="sm"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="px-3 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}