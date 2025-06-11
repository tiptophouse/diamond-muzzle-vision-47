
import { useState } from "react";
import { Heart, Eye, Share2, MessageCircle, Award, Gem, Camera, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AdminStoreControls } from "./AdminStoreControls";
import { toast } from "@/components/ui/use-toast";

interface PremiumDiamondCardProps {
  diamond: Diamond;
  index?: number;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function PremiumDiamondCard({ diamond, index = 0, onUpdate, onDelete }: PremiumDiamondCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useTelegramAuth();
  const { deleteDiamond } = useInventoryCrud({ onSuccess: onUpdate });

  const isManager = user?.id === 101;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this diamond?')) {
      await deleteDiamond(diamond.id, diamond);
      if (onDelete) onDelete();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${diamond.carat}ct ${diamond.shape} Diamond - ${diamond.color} ${diamond.clarity}`,
      text: `Check out this stunning ${diamond.carat} carat ${diamond.shape} diamond with ${diamond.color} color and ${diamond.clarity} clarity. Priced at ${formattedPrice}.`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
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

  // Get all available images including additional ones
  const allImages = [
    diamond.imageUrl,
    ...(diamond.additional_images || [])
  ].filter(Boolean);

  const currentImage = allImages[currentImageIndex] || null;

  return (
    <Card 
      className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-white border border-slate-200 hover:border-slate-300"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeIn 0.6s ease-out forwards',
      }}
      onMouseEnter={() => setShowAdminControls(true)}
      onMouseLeave={() => setShowAdminControls(false)}
    >
      {/* Premium Glass Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      
      <CardContent className="p-0">
        {/* Enhanced Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <>
              <img 
                src={currentImage} 
                alt={`${diamond.carat}ct ${diamond.shape} Diamond ${diamond.color} ${diamond.clarity} - Stock #${diamond.stockNumber}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              
              {/* Premium Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Image Navigation */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
              <div className="text-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Gem className="h-10 w-10 text-white" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Premium Diamond</p>
              </div>
            </div>
          )}
          
          {/* Enhanced Status and Certification Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge 
              variant={diamond.status === "Available" ? "default" : "secondary"}
              className={`${
                diamond.status === "Available" 
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg" 
                  : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
              } backdrop-blur-sm`}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {diamond.status}
            </Badge>
            {diamond.lab && (
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-slate-700 border-slate-300 shadow-lg">
                <Award className="h-3 w-3 mr-1" />
                {diamond.lab}
              </Badge>
            )}
          </div>

          {/* Premium Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-slate-600" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
            >
              <Eye className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          {/* Manager Controls */}
          {isManager && showAdminControls && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
              <AdminStoreControls 
                diamond={diamond} 
                onUpdate={onUpdate || (() => {})} 
                onDelete={onDelete || (() => {})} 
              />
            </div>
          )}
        </div>

        {/* Enhanced Content Section */}
        <div className="p-5 space-y-4">
          {/* Premium Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-xl leading-tight">
                {diamond.carat}ct {diamond.shape}
              </h3>
              <p className="text-sm text-slate-600 font-medium">#{diamond.stockNumber}</p>
              {diamond.certificate_number && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Cert: {diamond.certificate_number}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {formattedPrice}
              </p>
              <p className="text-xs text-slate-500">
                ${pricePerCarat.toLocaleString()}/ct
              </p>
            </div>
          </div>

          {/* Premium 4Cs Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-xs text-slate-500 font-medium mb-1">Color</p>
              <p className="font-bold text-slate-900 text-lg">{diamond.color}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-xs text-slate-500 font-medium mb-1">Clarity</p>
              <p className="font-bold text-slate-900 text-lg">{diamond.clarity}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-xs text-slate-500 font-medium mb-1">Cut</p>
              <p className="font-bold text-slate-900 text-lg">{diamond.cut}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-xs text-slate-500 font-medium mb-1">Fluorescence</p>
              <p className="font-bold text-slate-900 text-sm">{diamond.fluorescence || 'None'}</p>
            </div>
          </div>

          {/* Premium Quality Indicators */}
          {(diamond.polish || diamond.symmetry) && (
            <div className="grid grid-cols-2 gap-2">
              {diamond.polish && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 text-center border border-blue-200">
                  <span className="text-xs font-medium text-blue-700 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3" />
                    Polish: {diamond.polish}
                  </span>
                </div>
              )}
              {diamond.symmetry && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 text-center border border-purple-200">
                  <span className="text-xs font-medium text-purple-700 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3" />
                    Symm: {diamond.symmetry}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SEO Description */}
          {diamond.description && (
            <div className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              "{diamond.description}"
            </div>
          )}

          {/* Premium Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleContact}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Owner
            </Button>
            {isManager && (
              <Button 
                variant="outline" 
                size="sm" 
                className="px-4 border-slate-300 hover:bg-slate-50 shadow-sm"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
