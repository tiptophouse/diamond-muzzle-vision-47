
import { useState, memo } from "react";
import { Heart, Share2, MessageCircle, Award, Gem, Star, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AdminStoreControls } from "@/components/store/AdminStoreControls";
import { toast } from "@/components/ui/use-toast";

interface ApplePremiumCardProps {
  diamond: Diamond;
  index?: number;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export const ApplePremiumCard = memo(function ApplePremiumCard({ 
  diamond, 
  index = 0, 
  onUpdate, 
  onDelete 
}: ApplePremiumCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { user } = useTelegramAuth();

  const isManager = user?.id === 101;

  const handleShare = async () => {
    const shareData = {
      title: `${diamond.carat}ct ${diamond.shape} Diamond`,
      text: `Stunning ${diamond.carat} carat ${diamond.shape} diamond with ${diamond.color} color and ${diamond.clarity} clarity. ${formattedPrice}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        toast({
          title: "Link copied! 📋",
          description: "Diamond details copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleContact = () => {
    const message = `Hi! I'm interested in this diamond:\n\n` +
      `Stock #: ${diamond.stockNumber}\n` +
      `${diamond.carat}ct ${diamond.shape}\n` +
      `${diamond.color} color, ${diamond.clarity} clarity\n` +
      `${diamond.cut} cut\n` +
      `Price: ${formattedPrice}\n\n` +
      `Could you please provide more details?`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=${encodedMessage}`;
    window.open(telegramUrl, '_blank');
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(diamond.price);

  const pricePerCarat = Math.round(diamond.price / diamond.carat);

  const allImages = [
    diamond.imageUrl,
    ...(diamond.additional_images || [])
  ].filter(Boolean);

  const currentImage = allImages[currentImageIndex] || null;

  return (
    <Card 
      className="group relative overflow-hidden bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02] rounded-2xl"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: 'fade-in 0.8s ease-out forwards',
      }}
      onMouseEnter={() => setShowAdminControls(true)}
      onMouseLeave={() => setShowAdminControls(false)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-50/20 pointer-events-none rounded-2xl" />
      
      <CardContent className="p-0">
        {/* Premium Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center overflow-hidden rounded-t-2xl">
          {currentImage ? (
            <>
              <img 
                src={currentImage} 
                alt={`${diamond.carat}ct ${diamond.shape} Diamond ${diamond.color} ${diamond.clarity} - Stock #${diamond.stockNumber}`}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                } group-hover:scale-105`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Premium overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Image navigation dots */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex 
                          ? 'bg-white shadow-lg scale-125' 
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-blue-500/80 to-purple-600/80 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                    <Gem className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">Premium Diamond</p>
              </div>
            </div>
          )}
          
          {/* Status and certification badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge 
              variant={diamond.status === "Available" ? "default" : "secondary"}
              className={`${
                diamond.status === "Available" 
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg border-0" 
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg border-0"
              } backdrop-blur-sm rounded-full px-3 py-1`}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {diamond.status}
            </Badge>
            {diamond.lab && (
              <Badge 
                variant="outline" 
                className="bg-white/95 backdrop-blur-sm text-slate-700 border-slate-200/60 shadow-sm rounded-full px-3 py-1"
              >
                <Award className="h-3 w-3 mr-1" />
                {diamond.lab}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg border-0 rounded-full"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg border-0 rounded-full"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-slate-600" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg border-0 rounded-full"
            >
              <Eye className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          {/* Manager controls overlay */}
          {isManager && showAdminControls && (
            <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center rounded-t-2xl">
              <AdminStoreControls 
                diamond={diamond} 
                onUpdate={onUpdate || (() => {})} 
                onDelete={onDelete || (() => {})} 
              />
            </div>
          )}
        </div>

        {/* Content section with Apple-like spacing and typography */}
        <div className="p-6 space-y-5">
          {/* Header with perfect typography hierarchy */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 text-xl leading-tight tracking-tight">
                {diamond.carat}ct {diamond.shape}
              </h3>
              <p className="text-sm text-slate-500 font-medium">#{diamond.stockNumber}</p>
              {diamond.certificate_number && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Award className="h-3 w-3" />
                  Certificate: {diamond.certificate_number}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {formattedPrice}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                ${pricePerCarat.toLocaleString()}/ct
              </p>
            </div>
          </div>

          {/* 4Cs in Apple card style */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Color', value: diamond.color },
              { label: 'Clarity', value: diamond.clarity },
              { label: 'Cut', value: diamond.cut },
              { label: 'Fluorescence', value: diamond.fluorescence || 'None' }
            ].map((spec, idx) => (
              <div 
                key={spec.label}
                className="bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-2xl p-4 text-center border border-slate-200/40 hover:border-slate-300/60 transition-colors"
              >
                <p className="text-xs text-slate-500 font-medium mb-1 tracking-wide uppercase">
                  {spec.label}
                </p>
                <p className="font-semibold text-slate-900 text-lg">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>

          {/* Quality indicators */}
          {(diamond.polish || diamond.symmetry) && (
            <div className="grid grid-cols-2 gap-2">
              {diamond.polish && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100">
                  <span className="text-xs font-medium text-blue-700 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3" />
                    Polish: {diamond.polish}
                  </span>
                </div>
              )}
              {diamond.symmetry && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-100">
                  <span className="text-xs font-medium text-purple-700 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3" />
                    Symmetry: {diamond.symmetry}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Premium action button */}
          <div className="pt-2">
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl h-12 font-medium"
              onClick={handleContact}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Owner
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
