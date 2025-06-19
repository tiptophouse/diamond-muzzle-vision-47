
import { useState } from "react";
import { Heart, Eye, Share2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ContactBuyerModal } from "./ContactBuyerModal";
import { Gem360Viewer } from "./Gem360Viewer";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuth";
import { useDeleteDiamond } from "@/hooks/inventory/useDeleteDiamond";
import { useToast } from "@/hooks/use-toast";

interface ModernDiamondCardProps {
  diamond: Diamond;
  onUpdate?: () => void;
  storeOwnerId?: number;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function ModernDiamondCard({ 
  diamond, 
  onUpdate, 
  storeOwnerId,
  removeDiamondFromState,
  restoreDiamondToState
}: ModernDiamondCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [showGem360, setShowGem360] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const { deleteDiamond } = useDeleteDiamond({
    onSuccess: onUpdate,
    removeDiamondFromState,
    restoreDiamondToState,
  });

  const isOwner = user?.id === storeOwnerId;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete diamond ${diamond.stockNumber}?`)) {
      const success = await deleteDiamond(diamond.id, diamond);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "Failed to delete diamond. Please try again.",
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getShapeEmoji = (shape: string) => {
    const shapeEmojis: Record<string, string> = {
      'Round': '⭕',
      'Princess': '⬜',
      'Emerald': '💎',
      'Oval': '🥚',
      'Marquise': '🌙',
      'Pear': '💧',
      'Cushion': '📱',
      'Asscher': '⬛',
      'Heart': '❤️',
      'Radiant': '✨'
    };
    return shapeEmojis[shape] || '💎';
  };

  return (
    <>
      <Card className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-[1.02]">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {diamond.imageUrl ? (
            <img
              src={diamond.imageUrl}
              alt={`Diamond ${diamond.stockNumber}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-center">
                <div className="text-4xl mb-2">{getShapeEmoji(diamond.shape)}</div>
                <p className="text-sm text-gray-500 font-medium">{diamond.shape}</p>
              </div>
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                onClick={() => setShowContact(true)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              {diamond.gem360Url && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                  onClick={() => setShowGem360(true)}
                >
                  <Share2 className="h-4 w-4" />
                  360°
                </Button>
              )}
            </div>
          </div>

          {/* Like Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-3 right-3 w-8 h-8 rounded-full ${
              isLiked 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white/80 hover:bg-white text-gray-600'
            } shadow-lg transition-all duration-200`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>

          {/* Owner Actions */}
          {isOwner && (
            <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-600 shadow-lg"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full shadow-lg">
            <span className="font-bold text-sm">{formatPrice(diamond.price)}</span>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900 truncate">
              #{diamond.stockNumber}
            </h3>
            <Badge 
              variant="secondary" 
              className="bg-green-100 text-green-800 border-green-200 font-medium"
            >
              {diamond.status}
            </Badge>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Carat:</span>
                <span className="font-semibold text-gray-900">{diamond.carat}ct</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Color:</span>
                <span className="font-semibold text-gray-900">{diamond.color}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Clarity:</span>
                <span className="font-semibold text-gray-900">{diamond.clarity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cut:</span>
                <span className="font-semibold text-gray-900">{diamond.cut}</span>
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          {diamond.lab && (
            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <span>Certified by {diamond.lab}</span>
              {diamond.certificateNumber && (
                <span className="font-mono">#{diamond.certificateNumber}</span>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setShowContact(true)}
          >
            Contact Seller
          </Button>
        </CardContent>
      </Card>

      {/* Contact Modal */}
      {showContact && (
        <ContactBuyerModal
          diamond={diamond}
          isOpen={showContact}
          onClose={() => setShowContact(false)}
        />
      )}

      {/* Gem360 Viewer */}
      {showGem360 && diamond.gem360Url && (
        <Gem360Viewer
          url={diamond.gem360Url}
          isOpen={showGem360}
          onClose={() => setShowGem360(false)}
          diamondInfo={{
            stockNumber: diamond.stockNumber,
            shape: diamond.shape,
            carat: diamond.carat,
            color: diamond.color,
            clarity: diamond.clarity
          }}
        />
      )}
    </>
  );
}
