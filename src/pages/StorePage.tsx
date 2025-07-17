
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CollapsibleFilters } from "@/components/store/CollapsibleFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { ImageUpload } from "@/components/store/ImageUpload";
import { FloatingShareButton } from "@/components/store/FloatingShareButton";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image, Filter } from "lucide-react";
import { toast } from 'sonner';

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showUpload, setShowUpload] = useState(false);
  const [searchParams] = useSearchParams();
  const stockNumber = searchParams.get('stock');
  const { selectionChanged } = useTelegramHapticFeedback();

  const navigate = useNavigate();

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
      const stockMatch = filteredDiamonds.filter(diamond => 
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
      const paramMatch = filteredDiamonds.filter(diamond => {
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
    
    return filteredDiamonds;
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

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} enabled={!loading}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 pb-safe">
          {/* Header with Upload Button and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <StoreHeader 
              totalDiamonds={finalFilteredDiamonds.length}
              onOpenFilters={() => {}}
            />
            
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Filters Button - placed prominently */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 touch-target min-h-[44px] border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {(filters.shapes?.length || 0) + (filters.colors?.length || 0) + (filters.clarities?.length || 0) > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {(filters.shapes?.length || 0) + (filters.colors?.length || 0) + (filters.clarities?.length || 0)}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Filter className="h-5 w-5" />
                      Refine Your Search
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <CollapsibleFilters
                      filters={filters}
                      onUpdateFilter={updateFilter}
                      onClearFilters={clearFilters}
                      diamonds={diamonds || []}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showUpload} onOpenChange={setShowUpload}>
                <DialogTrigger asChild>
                  <Button className="flex-1 sm:flex-none flex items-center justify-center gap-2 touch-target min-h-[44px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload Photo</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Image className="h-5 w-5" />
                      Upload Image to Store
                    </DialogTitle>
                  </DialogHeader>
                  <ImageUpload onImageUploaded={handleImageUploaded} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Store Grid - Users see product cards first */}
          <StoreGrid
            diamonds={finalFilteredDiamonds}
            loading={loading}
            error={error}
            onUpdate={refetch}
          />
        </div>

        {/* Floating Share Button - Repositioned to avoid bottom nav */}
        <div className="fixed bottom-24 right-4 z-40">
          <FloatingShareButton />
        </div>
      </div>
    </MobilePullToRefresh>
  );
}

