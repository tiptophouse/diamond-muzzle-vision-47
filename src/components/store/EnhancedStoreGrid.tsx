
import { useMemo } from "react";
import { OptimizedDiamondCard } from "./OptimizedDiamondCard";
import { DiamondCardSkeleton } from "./DiamondCardSkeleton";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle, Sparkles, Camera, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EnhancedStoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error?: string | null;
  onUpdate?: () => void;
}

export function EnhancedStoreGrid({ diamonds, loading, error, onUpdate }: EnhancedStoreGridProps) {
  // PHASE 5: Calculate media statistics for user insights
  const mediaStats = useMemo(() => {
    const with3D = diamonds.filter(d => d.gem360Url && d.gem360Url.trim()).length;
    const withImages = diamonds.filter(d => d.imageUrl && d.imageUrl.trim() && !d.gem360Url).length;
    const infoOnly = diamonds.length - with3D - withImages;
    
    return { with3D, withImages, infoOnly, total: diamonds.length };
  }, [diamonds]);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading state with media priority info */}
        <div className="text-center text-sm text-gray-500 p-4">
          Loading your catalog with priority for 3D viewers and images...
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 12 }, (_, i) => (
            <DiamondCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Diamonds</h3>
          <p className="text-sm sm:text-base text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Diamonds Found</h3>
          <p className="text-sm sm:text-base text-slate-600">Try adjusting your filters to see more diamonds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PHASE 5: Media Statistics Display - Enhanced for mobile */}
      {mediaStats.total > 0 && (
        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Catalog Overview</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Badge variant="default" className="gap-1 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3" />
              {mediaStats.with3D} with 3D View
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
              <Camera className="h-3 w-3" />
              {mediaStats.withImages} with Photos
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs sm:text-sm">
              <FileText className="h-3 w-3" />
              {mediaStats.infoOnly} Info Only
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing {mediaStats.total} diamonds prioritized by media availability (3D → Photos → Info) • ⚡ Fast caching enabled
          </p>
        </div>
      )}

      {/* PHASE 5: Optimized Grid with Priority-Based Layout and Image Prefetching */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {diamonds.map((diamond, index) => {
          console.log('🎯 GRID: Rendering diamond', diamond.stockNumber, 'with media:', {
            hasGem360: !!diamond.gem360Url,
            hasImage: !!diamond.imageUrl,
            gem360Url: diamond.gem360Url,
            imageUrl: diamond.imageUrl
          });

          // Prepare next 3 diamonds for prefetching
          const nextDiamonds = diamonds
            .slice(index + 1, index + 4)
            .filter(d => d.imageUrl)
            .map(d => ({
              url: d.imageUrl!,
              id: d.id.toString()
            }));
          
          return (
            <div 
              key={diamond.id} 
              className="touch-target"
              style={{ 
                minHeight: '44px',
                contain: 'layout style paint'
              }}
            >
              <OptimizedDiamondCard 
                diamond={diamond}
                index={index}
                onUpdate={onUpdate}
                nextDiamonds={nextDiamonds}
              />
            </div>
          );
        })}
      </div>

      {/* PHASE 4: Debug Info (only show if there are issues) */}
      {diamonds.length > 0 && mediaStats.with3D === 0 && mediaStats.withImages === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            📊 Media Detection Debug
          </h4>
          <p className="text-xs text-yellow-700">
            No images or 3D viewers detected. Check console logs for field mapping details.
          </p>
        </div>
      )}
    </div>
  );
}
