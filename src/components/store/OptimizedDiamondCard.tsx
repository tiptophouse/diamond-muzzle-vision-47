
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/inventory/InventoryTable";
import { Eye, Share2, Sparkles, Camera, FileText } from "lucide-react";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";
import { MediaPriorityBadge } from "./MediaPriorityBadge";
import { FancyColorBadge } from "./FancyColorBadge";
import { toast } from "sonner";

interface OptimizedDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
}

export function OptimizedDiamondCard({ diamond, index, onUpdate }: OptimizedDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const { shareWithInlineButtons, isAvailable: sharingAvailable } = useSecureDiamondSharing();

  // Determine media priority for sorting
  const getMediaPriority = () => {
    if (diamond.gem360Url) return 1; // Highest priority
    if (diamond.imageUrl && !imageError) return 2; // Medium priority
    return 3; // Lowest priority - info only
  };

  const handleSecureShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!sharingAvailable) {
      toast.error('🔒 Secure sharing requires Telegram Mini App');
      return;
    }

    try {
      const success = await shareWithInlineButtons(diamond);
      
      if (success) {
        // Dispatch success event for notifications
        window.dispatchEvent(new CustomEvent('diamondShared', {
          detail: { 
            success: true, 
            message: `Diamond ${diamond.stockNumber} shared securely!` 
          }
        }));
      }
    } catch (error) {
      console.error('❌ Failed to share diamond:', error);
      
      // Dispatch failure event for notifications
      window.dispatchEvent(new CustomEvent('diamondShared', {
        detail: { 
          success: false, 
          message: `Failed to share diamond ${diamond.stockNumber}` 
        }
      }));
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to diamond detail view
    window.location.href = `/diamond/${diamond.id}`;
  };

  const renderMedia = () => {
    if (diamond.gem360Url) {
      return (
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg overflow-hidden">
          <iframe
            src={diamond.gem360Url}
            className="w-full h-full"
            title="360° Diamond View"
            loading="lazy"
          />
          <MediaPriorityBadge type="3d" className="absolute top-2 right-2" />
        </div>
      );
    }

    if (diamond.imageUrl && !imageError) {
      return (
        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={diamond.imageUrl}
            alt={`${diamond.carat} ct ${diamond.shape}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <MediaPriorityBadge type="image" className="absolute top-2 right-2" />
        </div>
      );
    }

    return (
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Diamond Information</p>
        </div>
        <MediaPriorityBadge type="info" className="absolute top-2 right-2" />
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        {renderMedia()}
        
        <div className="mt-4 space-y-3">
          {/* Header with carat and shape */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              {diamond.carat} ct {diamond.shape}
            </h3>
            <span className="text-xs text-gray-500">#{diamond.stockNumber}</span>
          </div>

          {/* Color and Clarity badges */}
          <div className="flex gap-2">
            <FancyColorBadge 
              color={diamond.color} 
              colorType={diamond.color_type} 
            />
            <Badge variant="outline" className="text-xs">
              {diamond.clarity}
            </Badge>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">
              ${diamond.price?.toLocaleString() || 'Contact for Price'}
            </span>
            <Badge variant="secondary" className="text-xs">
              {diamond.cut}
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleView}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSecureShare}
              disabled={!sharingAvailable}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
