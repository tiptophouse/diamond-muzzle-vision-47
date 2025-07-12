
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { StoreHeader } from "@/components/store/StoreHeader";
import { PremiumStoreFilters } from "@/components/store/PremiumStoreFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { ImageUpload } from "@/components/store/ImageUpload";
import { FloatingShareButton } from "@/components/store/FloatingShareButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image, ArrowLeft } from "lucide-react";

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showUpload, setShowUpload] = useState(false);
  const [searchParams] = useSearchParams();
  const stockNumber = searchParams.get('stock');

  const navigate = useNavigate();

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Back to Main Menu Button */}
      <div className="flex items-center pt-4 pb-2 pl-2 sm:pl-0">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 text-slate-700"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Back to Menu</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6">
        {/* Header with Upload Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <StoreHeader 
            totalDiamonds={finalFilteredDiamonds.length}
            onOpenFilters={() => {}}
          />
          
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 sm:h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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

        {/* Premium Fixed Filters */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-900/5">
          <PremiumStoreFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
            diamonds={diamonds || []}
          />
        </div>

        {/* Store Grid */}
        <StoreGrid
          diamonds={finalFilteredDiamonds}
          loading={loading}
          error={error}
          onUpdate={refetch}
        />
      </div>

      {/* Floating Share Button */}
      <FloatingShareButton />
    </div>
  );
}

