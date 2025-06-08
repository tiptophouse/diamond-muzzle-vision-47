
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoreProductCardProps {
  diamond: any;
  onClick: () => void;
}

export function StoreProductCard({ diamond, onClick }: StoreProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/store?item=${diamond.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${diamond.carat}ct ${diamond.shape} Diamond`,
        text: `Check out this beautiful ${diamond.carat}ct ${diamond.shape} diamond for ${formatPrice(diamond.price)}`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Diamond link has been copied to clipboard",
      });
    }
  };

  const handleContactSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create Telegram deep link
    const message = `Hi! I'm interested in this diamond:\n\n${diamond.carat}ct ${diamond.shape}\nColor: ${diamond.color}, Clarity: ${diamond.clarity}\nPrice: ${formatPrice(diamond.price)}\nStock: ${diamond.stockNumber}\n\nCould you please provide more information?`;
    
    // Get seller's Telegram ID (you'll need to fetch this from user_profiles table)
    // For now, we'll use a generic approach
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/store?item=' + diamond.id)}&text=${encodeURIComponent(message)}`;
    
    window.open(telegramUrl, '_blank');
    
    toast({
      title: "Opening Telegram...",
      description: "Opening Telegram to contact the seller",
    });
  };

  const imageUrl = diamond.imageUrl || diamond.picture || diamond.image || diamond.photo;

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1" onClick={onClick}>
      <CardContent className="p-0">
        {/* Diamond Image */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden relative">
          {imageUrl && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={imageUrl}
                alt={`${diamond.shape} Diamond`}
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={getStatusColor(diamond.status)}>
              {diamond.status || 'Available'}
            </Badge>
          </div>

          {/* Share Button */}
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Diamond Details */}
        <div className="p-4">
          <div className="space-y-2 mb-3">
            <h3 className="font-semibold text-gray-900 truncate">
              {diamond.carat}ct {diamond.shape} Diamond
            </h3>
            
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <div>Color: <span className="font-medium">{diamond.color}</span></div>
              <div>Clarity: <span className="font-medium">{diamond.clarity}</span></div>
              <div>Cut: <span className="font-medium">{diamond.cut}</span></div>
              <div>Lab: <span className="font-medium">{diamond.lab || 'GIA'}</span></div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(diamond.price)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              View Details
            </Button>
            <Button 
              size="sm" 
              className="flex-1 text-xs bg-green-600 hover:bg-green-700"
              onClick={handleContactSeller}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              I Want This
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
