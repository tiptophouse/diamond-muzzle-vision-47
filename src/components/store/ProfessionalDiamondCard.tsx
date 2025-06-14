
import { useState } from "react";
import { Heart, Eye, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";

interface ProfessionalDiamondCardProps {
  diamond: Diamond;
}

export function ProfessionalDiamondCard({ diamond }: ProfessionalDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Generate a placeholder diamond image URL or use actual image
  const diamondImageUrl = diamond.imageUrl || `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {!imageError ? (
          <img
            src={diamondImageUrl}
            alt={`${diamond.shape} Diamond`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Action Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className={`w-8 h-8 rounded-full bg-white/90 hover:bg-white ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-600"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>

        {/* GIA Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="text-xs font-medium text-gray-900">GIA</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          GIA {diamond.carat} Carat {diamond.color}-{diamond.clarity} {diamond.cut} Cut {diamond.shape} Diamond
        </h3>

        {/* Price */}
        <div className="text-lg font-bold text-gray-900">
          ${diamond.price.toLocaleString()}
        </div>

        {/* Quick Details - Horizontal Layout */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500">Carat</div>
            <div className="font-medium">{diamond.carat}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Color</div>
            <div className="font-medium">{diamond.color}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Clarity</div>
            <div className="font-medium">{diamond.clarity}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Cut</div>
            <div className="font-medium text-xs">{diamond.cut.slice(0, 4)}</div>
          </div>
        </div>

        {/* Stock Number */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Stock #{diamond.stockNumber}
        </div>
      </div>
    </div>
  );
}
