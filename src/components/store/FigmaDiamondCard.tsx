import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { toast } from "@/hooks/use-toast";

interface FigmaDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
}

export function FigmaDiamondCard({
  diamond,
  index,
  onUpdate
}: FigmaDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { impactOccurred } = useTelegramHapticFeedback();
  const navigate = useNavigate();

  const handleLike = () => {
    impactOccurred('light');
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `Diamond ${diamond.stockNumber} ${isLiked ? 'removed from' : 'added to'} your favorites.`
    });
  };

  const handleViewDetails = () => {
    impactOccurred('light');
    navigate(`/diamond/${diamond.stockNumber}`);
  };

  const isAvailable = diamond.status === "Available";

  return (
    <Card 
      id={`diamond-${diamond.stockNumber}`} 
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg border border-slate-200 bg-white rounded-2xl"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden rounded-t-2xl">
        {diamond.imageUrl && !imageError ? (
          <img 
            src={diamond.imageUrl} 
            alt={`${diamond.carat} ct ${diamond.shape} Diamond`} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            onError={() => setImageError(true)} 
            loading="lazy" 
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            className={`text-xs font-medium ${
              isAvailable 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-blue-100 text-blue-800 border-blue-200"
            }`}
            variant="outline"
          >
            {isAvailable ? "Available" : "Premium"}
          </Badge>
        </div>

        {/* Heart Icon */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <Heart 
            className={`h-4 w-4 ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-slate-600'
            }`} 
          />
        </button>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and Price */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base leading-tight">
              {diamond.carat} ct. {diamond.shape} Diamond
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {diamond.stockNumber}
            </p>
          </div>
          <p className="text-lg font-bold text-slate-900">
            ${diamond.price?.toLocaleString() || 'N/A'}
          </p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <span className="bg-slate-100 px-2 py-1 rounded">
            {diamond.color}
          </span>
          <span>•</span>
          <span className="bg-slate-100 px-2 py-1 rounded">
            {diamond.clarity}
          </span>
          <span>•</span>
          <span className="text-yellow-600 font-medium">Very good</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-9 border-slate-200"
            onClick={() => {
              // Contact action
              toast({ title: "Contact owner", description: "Opening contact options..." });
            }}
          >
            Contact
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-9 border-slate-200"
            onClick={handleViewDetails}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}