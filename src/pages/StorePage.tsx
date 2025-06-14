
import { useState } from "react";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFilters } from "@/components/store/StoreFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { ImageUpload } from "@/components/store/ImageUpload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image } from "lucide-react";

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Image uploaded to store:', imageUrl);
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header with Upload Button - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <StoreHeader 
            totalDiamonds={filteredDiamonds.length}
            onOpenFilters={() => setShowFilters(true)}
          />
          
          {/* Upload Button - Full width on mobile */}
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 sm:h-9">
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

        {/* Desktop Filters - Hidden on mobile */}
        <div className="hidden lg:block">
          <StoreFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
            diamonds={diamonds}
            isHorizontal={true}
          />
        </div>

        {/* Mobile Filters - Sheet */}
        <StoreFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          diamonds={diamonds}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          isMobile={true}
        />

        {/* Store Grid - Responsive */}
        <StoreGrid
          diamonds={filteredDiamonds}
          loading={loading}
          error={error}
          onUpdate={refetch}
        />
      </div>
    </div>
  );
}
