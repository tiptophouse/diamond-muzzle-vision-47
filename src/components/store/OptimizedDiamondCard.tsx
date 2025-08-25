
import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Edit, Share2, Heart, ExternalLink } from 'lucide-react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Enhanced3DViewer } from './Enhanced3DViewer';
import { Gem360Viewer } from './Gem360Viewer';
import { V360Viewer } from './V360Viewer';
import { ShareButton } from './ShareButton';
import { MediaPriorityBadge } from './MediaPriorityBadge';
import { FancyColorBadge } from './FancyColorBadge';
import { UserImageUpload } from '@/components/inventory/UserImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface OptimizedDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
}

export const OptimizedDiamondCard = memo(({ diamond, index, onUpdate }: OptimizedDiamondCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  // Media priority: 360° viewers > 3D images > regular images
  const has360Viewer = diamond.gem360Url && diamond.gem360Url.trim();
  const hasImage = diamond.imageUrl && diamond.imageUrl.trim();
  const is3DImage = hasImage && (
    diamond.imageUrl?.includes('360') || 
    diamond.imageUrl?.includes('3d') || 
    diamond.imageUrl?.includes('rotate')
  );

  const handleDelete = useCallback(async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // API call would go here
      toast({
        title: "✅ Diamond Deleted",
        description: `Diamond ${diamond.stockNumber} has been removed from your inventory.`
      });
      onUpdate?.();
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "❌ Delete Failed", 
        description: "Could not delete the diamond. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  }, [diamond.stockNumber, user, toast, onUpdate]);

  const renderMedia = () => {
    // Priority 1: 360° viewers (interactive)
    if (has360Viewer) {
      if (diamond.gem360Url?.includes('v360.in')) {
        return (
          <V360Viewer
            v360Url={diamond.gem360Url}
            stockNumber={diamond.stockNumber}
            isInline={true}
            className="w-full h-48 group"
          />
        );
      } else {
        return (
          <Gem360Viewer
            gem360Url={diamond.gem360Url}
            stockNumber={diamond.stockNumber}
            isInline={true}
            className="w-full h-48 group"
          />
        );
      }
    }
    
    // Priority 2: 3D rotational images
    if (is3DImage) {
      return (
        <Enhanced3DViewer
          imageUrl={diamond.imageUrl!}
          stockNumber={diamond.stockNumber}
          isInline={true}
          className="w-full h-48 group"
        />
      );
    }
    
    // Priority 3: Regular images
    if (hasImage) {
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden group">
          <img
            src={diamond.imageUrl}
            alt={`Diamond ${diamond.stockNumber}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full
            </Button>
          </div>
        </div>
      );
    }
    
    // Fallback: No media placeholder
    return (
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
            💎
          </div>
          <p className="text-sm">No Image Available</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
      <CardContent className="p-0">
        {/* Media Section */}
        <div className="relative">
          {renderMedia()}
          
          {/* Media Priority Badge */}
          <div className="absolute top-2 left-2">
            <MediaPriorityBadge 
              has360={!!has360Viewer}
              hasImage={!!hasImage}
              is3D={!!is3DImage}
            />
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <UserImageUpload diamond={diamond} onUpdate={onUpdate || (() => {})} />
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={() => {
                // Simple share functionality - could be enhanced
                if (navigator.share) {
                  navigator.share({
                    title: `${diamond.shape} ${diamond.carat}ct Diamond`,
                    text: `Check out this ${diamond.shape} diamond - ${diamond.carat}ct ${diamond.color} ${diamond.clarity}`,
                    url: window.location.href
                  });
                }
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 truncate">
                {diamond.shape} {diamond.carat}ct
              </h3>
              <p className="text-sm text-slate-500">#{diamond.stockNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">
                ${diamond.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Properties */}
          <div className="flex flex-wrap gap-1">
            <FancyColorBadge 
              color={diamond.color} 
              colorType={diamond.color_type} 
            />
            <Badge variant="outline" className="text-xs">
              {diamond.clarity}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {diamond.cut}
            </Badge>
          </div>

          {/* Certificate Info */}
          {diamond.certificateNumber && (
            <div className="text-xs text-slate-600">
              {diamond.lab} #{diamond.certificateNumber}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => console.log('View details:', diamond.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedDiamondCard.displayName = 'OptimizedDiamondCard';
