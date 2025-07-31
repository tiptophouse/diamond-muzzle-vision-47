
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, ExternalLink, Copy, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StoreVisibilityToggle } from "./StoreVisibilityToggle";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/diamondUtils";
import { Diamond } from "@/components/inventory/InventoryTable";
import { ThreeDViewer } from "@/components/store/ThreeDViewer";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { useNavigate } from "react-router-dom";
import { V360Viewer } from './V360Viewer';
import { Gem360Viewer } from './Gem360Viewer';

interface OptimizedDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate: () => void;
}

export function OptimizedDiamondCard({ diamond, index, onUpdate }: OptimizedDiamondCardProps) {
  const [toggleLoading, setToggleLoading] = useState(false);
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();
  const { toast } = useToast();
  const { updateDiamond, deleteDiamond } = useInventoryCrud({ onSuccess: onUpdate });
  const navigate = useNavigate();

  const isOwner = true; // Replace with actual ownership check

  const handleToggleStoreVisibility = useCallback(async () => {
    impactOccurred('light');
    setToggleLoading(true);
    
    try {
      await updateDiamond(diamond.id, {
        ...diamond,
        store_visible: !diamond.store_visible,
      });
      
      toast({
        title: "Visibility Updated",
        description: `Diamond is now ${diamond.store_visible ? 'hidden' : 'visible'} in store`,
      });
    } catch (error) {
      toast({
        title: "Failed to Update Visibility",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setToggleLoading(false);
    }
  }, [diamond, impactOccurred, updateDiamond, toast]);

  const handleEditDiamond = useCallback(() => {
    impactOccurred('light');
    navigate(`/edit-stone/${diamond.id}`);
  }, [diamond, impactOccurred, navigate]);

  const handleDeleteDiamond = useCallback(async () => {
    notificationOccurred('warning');
    
    try {
      await deleteDiamond(diamond.id);
      toast({
        title: "Diamond Deleted",
        description: "Diamond has been removed from your inventory.",
      });
    } catch (error) {
      toast({
        title: "Failed to Delete Diamond",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }, [diamond, deleteDiamond, notificationOccurred, toast]);

  const handleShareDiamond = useCallback(() => {
    impactOccurred('light');
    
    const shareText = `Check out this ${diamond.carat}ct ${diamond.shape} diamond! ${formatCurrency(diamond.price)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Diamond ${diamond.stockNumber}`,
        text: shareText,
        url: window.location.href,
      }).then(() => {
        toast({
          title: "Diamond Shared",
          description: "Diamond details shared successfully.",
        });
      }).catch((error) => {
        console.error("Error sharing:", error);
        toast({
          title: "Share Failed",
          description: "Failed to share diamond details.",
          variant: "destructive",
        });
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Details Copied",
          description: "Diamond details copied to clipboard.",
        });
      }).catch((error) => {
        console.error("Error copying:", error);
        toast({
          title: "Copy Failed",
          description: "Failed to copy diamond details.",
          variant: "destructive",
        });
      });
    }
  }, [diamond, impactOccurred, toast]);

  // Enhanced media viewer logic
  const renderMediaViewer = useMemo(() => {
    // Priority: V360 > Gem360 > Regular image
    if (diamond.v360Url) {
      return (
        <V360Viewer
          v360Url={diamond.v360Url}
          stockNumber={diamond.stockNumber}
          isInline={true}
        />
      );
    }
    
    if (diamond.gem360Url) {
      return (
        <Gem360Viewer
          gem360Url={diamond.gem360Url}
          stockNumber={diamond.stockNumber}
          isInline={true}
        />
      );
    }
    
    // Fallback to regular image or 3D viewer if available
    if (diamond.imageUrl) {
      return (
        <ThreeDViewer
          imageUrl={diamond.imageUrl}
          stockNumber={diamond.stockNumber}
        />
      );
    }
    
    // Default placeholder
    return (
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">💎</div>
          <div className="text-sm">{diamond.shape}</div>
          <div className="text-xs">#{diamond.stockNumber}</div>
        </div>
      </div>
    );
  }, [diamond.v360Url, diamond.gem360Url, diamond.imageUrl, diamond.stockNumber, diamond.shape]);

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white via-gray-50/30 to-white shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        {/* Enhanced Media Viewer with Modern Frame */}
        <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="absolute inset-2 rounded-xl overflow-hidden border border-white/20 shadow-inner">
            {renderMediaViewer}
          </div>
          
          {/* Elegant Corner Accent */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-blue-400/20 to-transparent" />
          
          {/* Media Type Indicators - Redesigned */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {diamond.v360Url && (
              <div className="bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium border border-white/20">
                360°
              </div>
            )}
            {diamond.videoUrl && (
              <div className="bg-purple-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium border border-white/20">
                VIDEO
              </div>
            )}
            {diamond.certificateImageUrl && (
              <div className="bg-emerald-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium border border-white/20">
                CERT
              </div>
            )}
          </div>

          {/* Store visibility toggle - Refined */}
          {isOwner && (
            <div className="absolute top-3 left-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 border border-gray-200/50">
                <StoreVisibilityToggle
                  isVisible={diamond.store_visible}
                  onToggle={handleToggleStoreVisibility}
                  isLoading={toggleLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Content Layout */}
      <div className="p-5 space-y-4">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {diamond.carat}ct {diamond.shape}
            </h3>
            <div className="flex items-center gap-2">
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-md border border-gray-200/50">
                    <DropdownMenuLabel className="text-gray-700">Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleEditDiamond} className="hover:bg-blue-50">
                      <Pencil className="mr-2 h-4 w-4 text-blue-600" /> Edit Stone
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteDiamond} className="hover:bg-red-50 text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Stone
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="hover:bg-emerald-50">
                      <ExternalLink className="mr-2 h-4 w-4 text-emerald-600" />
                      <a href={`https://gia.edu/report-check?reportno=${diamond.certificateNumber}`} target="_blank" rel="noopener noreferrer">
                        View GIA Report
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-50">
                      <Copy className="mr-2 h-4 w-4 text-gray-600" /> Copy Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          {/* Specs Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/50">
              {diamond.color}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/50">
              {diamond.clarity}
            </span>
            {diamond.cut && diamond.cut !== 'N/A' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                {diamond.cut}
              </span>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {formatCurrency(diamond.price)}
            </div>
            {diamond.carat > 0 && (
              <div className="text-sm text-gray-500 font-medium">
                {formatCurrency(Math.round(diamond.price / diamond.carat))}/ct
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={diamond.status === 'Available' ? 'default' : 'secondary'} 
              className={`font-medium ${
                diamond.status === 'Available' 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {diamond.status}
            </Badge>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            onClick={handleShareDiamond}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 font-medium py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Share Diamond
          </Button>
        </div>

        {/* Stock Number Footer */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400 font-mono tracking-wider uppercase">
            Stock #{diamond.stockNumber}
          </div>
        </div>
      </div>
    </Card>
  );
}