
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
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
      <div className="relative">
        {/* Enhanced Media Viewer */}
        <div className="aspect-square overflow-hidden rounded-t-lg">
          {renderMediaViewer}
        </div>

        {/* Media Type Indicators */}
        <div className="absolute top-2 right-2 flex gap-1">
          {diamond.v360Url && (
            <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0.5">
              360°
            </Badge>
          )}
          {diamond.videoUrl && (
            <Badge className="bg-purple-600 text-white text-xs px-1.5 py-0.5">
              VIDEO
            </Badge>
          )}
          {diamond.certificateImageUrl && (
            <Badge className="bg-green-600 text-white text-xs px-1.5 py-0.5">
              CERT
            </Badge>
          )}
        </div>

        {/* Store visibility toggle */}
        {isOwner && (
          <div className="absolute top-2 left-2">
            <StoreVisibilityToggle
              isVisible={diamond.store_visible}
              onToggle={handleToggleStoreVisibility}
              isLoading={toggleLoading}
            />
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          {diamond.carat}ct {diamond.shape}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {diamond.color} / {diamond.clarity}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">{formatCurrency(diamond.price)}</div>
          <Badge variant="secondary">{diamond.status}</Badge>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 pb-2">
        <Button variant="secondary" size="sm" onClick={handleShareDiamond}>
          Share
        </Button>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEditDiamond}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteDiamond}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                <a href={`https://gia.edu/report-check?reportno=${diamond.certificateNumber}`} target="_blank" rel="noopener noreferrer">
                  View GIA Report
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" /> Copy Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
}
