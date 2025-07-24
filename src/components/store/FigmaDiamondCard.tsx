import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminStoreControls } from "./AdminStoreControls";
import { SecureShareButton } from "./SecureShareButton";
import { WishlistButton } from "./WishlistButton";
import { ThreeDViewer } from "./ThreeDViewer";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Diamond } from "@/components/inventory/InventoryTable";
import { MessageCircle, Eye, Zap } from "lucide-react";
import { TelegramContactButton } from "./TelegramContactButton";

interface FigmaDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate: () => void;
}

export function FigmaDiamondCard({ diamond, index, onUpdate }: FigmaDiamondCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { user } = useTelegramAuth();
  const { impactOccurred } = useTelegramHapticFeedback();

  const handleContactClick = () => {
    impactOccurred('light');
    // Contact functionality would be implemented here
  };

  const handleViewClick = () => {
    impactOccurred('light');
    // Navigate to specific diamond page with stock number
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('stock', diamond.stockNumber);
    window.history.pushState({}, '', currentUrl.toString());
    
    // Scroll to the diamond card
    setTimeout(() => {
      const element = document.getElementById(`diamond-${diamond.stockNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const getOwnerTelegramId = () => {
    // Since Diamond interface doesn't have userId, we'll use the current user's ID
    // In a real scenario, this would come from the diamond data
    return user?.id || 0;
  };

  return (
    <Card 
      id={`diamond-${diamond.stockNumber}`}
      className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
          {diamond.imageUrl || diamond.picture ? (
            <img
              src={diamond.imageUrl || diamond.picture}
              alt={`${diamond.shape} Diamond`}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">{diamond.shape}</p>
                <p className="text-xs text-gray-500">Diamond</p>
              </div>
            </div>
          )}
          
          {/* Top Controls */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
            <Badge className="bg-white/90 text-gray-800 shadow-sm">
              Stock: {diamond.stockNumber}
            </Badge>
            <div className="flex items-center gap-1">
              <WishlistButton 
                diamond={diamond} 
                ownerTelegramId={getOwnerTelegramId()} 
                className="bg-white/90 hover:bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Admin Controls */}
          <AdminStoreControls diamond={diamond} onUpdate={onUpdate} onDelete={onUpdate} />
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {diamond.carat}ct {diamond.shape}
              </h3>
              <p className="text-sm text-gray-600">
                {diamond.color} • {diamond.clarity} • {diamond.cut}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                ${diamond.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                ${Math.round(diamond.price / diamond.carat).toLocaleString()}/ct
              </p>
            </div>
          </div>

          {/* Diamond Details Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Shape</p>
              <p className="font-medium text-gray-900">{diamond.shape}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Color</p>
              <p className="font-medium text-gray-900">{diamond.color}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Clarity</p>
              <p className="font-medium text-gray-900">{diamond.clarity}</p>
            </div>
          </div>

          {/* 3D Viewer */}
          {diamond.gem360Url && (
            <ThreeDViewer 
              imageUrl={diamond.gem360Url}
              stockNumber={diamond.stockNumber}
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewClick}
              className="flex-1 h-9 text-xs"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <TelegramContactButton
              diamond={diamond}
              ownerTelegramId={getOwnerTelegramId()}
              className="flex-1 h-9 text-xs"
            />
            <SecureShareButton
              stockNumber={diamond.stockNumber}
              diamond={diamond}
              variant="outline"
              size="sm"
              className="h-9 px-3"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
