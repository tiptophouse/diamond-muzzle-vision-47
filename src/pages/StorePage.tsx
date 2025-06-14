
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
  const {
    filteredDiamonds,
    selectedShape,
    setSelectedShape,
    colorRange,
    setColorRange,
    clarityRange,
    setClarityRange,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    resetFilters,
  } = useStoreFilters(diamonds);

  const [showUpload, setShowUpload] = useState(false);

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Image uploaded to store:', imageUrl);
    setShowUpload(false);
    // You can add additional logic here if needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Upload Button */}
        <div className="flex items-center justify-between">
          <StoreHeader />
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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

        {/* Filters */}
        <StoreFilters
          selectedShape={selectedShape}
          onShapeChange={setSelectedShape}
          colorRange={colorRange}
          onColorChange={setColorRange}
          clarityRange={clarityRange}
          onClarityChange={setClarityRange}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={resetFilters}
        />

        {/* Store Grid */}
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
