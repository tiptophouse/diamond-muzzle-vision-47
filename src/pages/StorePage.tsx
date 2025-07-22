
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { EnhancedStoreHeader } from "@/components/store/EnhancedStoreHeader";
import { FigmaStoreFilters } from "@/components/store/FigmaStoreFilters";
import { FigmaDiamondCard } from "@/components/store/FigmaDiamondCard";
import { DiamondCardSkeleton } from "@/components/store/DiamondCardSkeleton";
import { ImageUpload } from "@/components/store/ImageUpload";
import { FloatingShareButton } from "@/components/store/FloatingShareButton";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image, Filter, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { Diamond } from "@/components/inventory/InventoryTable";

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("most-popular");
  const [searchParams] = useSearchParams();
  const stockNumber = searchParams.get('stock');
  const { selectionChanged } = useTelegramHapticFeedback();

  const navigate = useNavigate();

  // Sort diamonds based on selected sort option
  const sortedDiamonds = useMemo(() => {
    const diamonds = [...filteredDiamonds];
    
    switch (sortBy) {
      case "price-low-high":
        return diamonds.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return diamonds.sort((a, b) => b.price - a.price);
      case "carat-low-high":
        return diamonds.sort((a, b) => a.carat - b.carat);
      case "carat-high-low":
        return diamonds.sort((a, b) => b.carat - a.carat);
      case "newest":
        return diamonds.sort((a, b) => a.stockNumber.localeCompare(b.stockNumber));
      case "most-popular":
      default:
        return diamonds; // Keep original order for "most popular"
    }
  }, [filteredDiamonds, sortBy]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast.success('Store refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh store');
      throw error;
    }
  }, [refetch]);

  // Filter to specific diamond if URL parameters are provided
  const finalFilteredDiamonds = (() => {
    if (stockNumber) {
      const stockMatch = sortedDiamonds.filter(diamond => 
        diamond.stockNumber === stockNumber
      );
      if (stockMatch.length > 0) {
        console.log('🔍 Found diamond by stock number:', stockNumber, stockMatch);
        return stockMatch;
      }
    }
    
    // If no stock match or no stock parameter, check other URL parameters for filtering
    const carat = searchParams.get('carat');
    const color = searchParams.get('color');
    const clarity = searchParams.get('clarity');
    const shape = searchParams.get('shape');
    
    if (carat || color || clarity || shape) {
      const paramMatch = sortedDiamonds.filter(diamond => {
        const matches = [];
        if (carat) matches.push(Math.abs(diamond.carat - parseFloat(carat)) < 0.01);
        if (color) matches.push(diamond.color === color);
        if (clarity) matches.push(diamond.clarity === clarity);
        if (shape) matches.push(diamond.shape === shape);
        return matches.every(match => match);
      });
      
      if (paramMatch.length > 0) {
        console.log('🔍 Found diamond by parameters:', { carat, color, clarity, shape }, paramMatch);
        return paramMatch;
      }
    }
    
    return sortedDiamonds;
  })();

  // Auto-scroll to diamond if found via stock parameter
  useEffect(() => {
    if (stockNumber && finalFilteredDiamonds.length > 0) {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        const element = document.getElementById(`diamond-${stockNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [stockNumber, finalFilteredDiamonds]);

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Image uploaded to store:', imageUrl);
    setShowUpload(false);
    selectionChanged(); // Add haptic feedback
    toast.success('Image uploaded successfully!');
  };

  const renderStoreGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <DiamondCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Diamonds</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      );
    }

    if (finalFilteredDiamonds.length === 0) {
      return (
        <div className="flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Diamonds Found</h3>
            <p className="text-slate-600">Try adjusting your filters to see more diamonds.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {finalFilteredDiamonds.map((diamond, index) => (
          <FigmaDiamondCard 
            key={diamond.id} 
            diamond={diamond}
            index={index}
            onUpdate={refetch}
          />
        ))}
      </div>
    );
  };

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} enabled={!loading}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
          
          {/* Enhanced Header with Sorting */}
          <EnhancedStoreHeader
            totalDiamonds={finalFilteredDiamonds.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onOpenFilters={() => setShowFilters(true)}
          />

          {/* Upload Button */}
          <div className="flex justify-end">
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Upload Image to Store
                  </DialogTitle>
                </DialogHeader>
                <ImageUpload onImageUploaded={handleImageUploaded} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Diamond Grid */}
          {renderStoreGrid()}

          {/* Filters Dialog */}
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogContent className="w-[95vw] max-w-md max-h-[85vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </DialogTitle>
              </DialogHeader>
              <FigmaStoreFilters
                filters={filters}
                onUpdateFilter={updateFilter}
                onClearFilters={clearFilters}
                onApplyFilters={() => setShowFilters(false)}
                diamonds={diamonds || []}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Floating Share Button */}
        <div className="fixed bottom-6 right-4 z-40">
          <FloatingShareButton />
        </div>
      </div>
    </MobilePullToRefresh>
  );
}

