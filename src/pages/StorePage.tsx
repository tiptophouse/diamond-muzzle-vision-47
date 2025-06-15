
import { useState } from "react";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { StoreHeader } from "@/components/store/StoreHeader";
import { PremiumStoreFilters } from "@/components/store/PremiumStoreFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { ImageUpload } from "@/components/store/ImageUpload";
import { FloatingShareButton } from "@/components/store/FloatingShareButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image } from "lucide-react";

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showUpload, setShowUpload] = useState(false);

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Image uploaded to store:', imageUrl);
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6">
        {/* Header with Upload Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <StoreHeader 
            totalDiamonds={filteredDiamonds.length}
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
          diamonds={filteredDiamonds}
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
