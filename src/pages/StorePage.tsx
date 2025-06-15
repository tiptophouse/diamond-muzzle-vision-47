
import { useState } from "react";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { useUserRole } from "@/hooks/useUserRole";
import { RoleBasedStoreHeader } from "@/components/store/RoleBasedStoreHeader";
import { RoleBasedStoreFilters } from "@/components/store/RoleBasedStoreFilters";
import { RoleBasedStoreGrid } from "@/components/store/RoleBasedStoreGrid";
import { ImageUpload } from "@/components/store/ImageUpload";
import { FloatingShareButton } from "@/components/store/FloatingShareButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image } from "lucide-react";

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const { userRole, isLoading: roleLoading } = useUserRole();
  const [showUpload, setShowUpload] = useState(false);

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Image uploaded to store:', imageUrl);
    setShowUpload(false);
  };

  // For free users, show full-screen conversational experience
  if (!roleLoading && userRole === 'FREE_USER') {
    return (
      <div className="h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 h-full flex flex-col gap-6">
          {/* Header */}
          <RoleBasedStoreHeader 
            totalDiamonds={filteredDiamonds.length}
            onOpenFilters={() => {}}
          />
          
          {/* Conversational Flow - Full Height */}
          <div className="flex-1 min-h-0">
            <RoleBasedStoreGrid
              diamonds={filteredDiamonds}
              loading={loading}
              error={error}
              onUpdate={refetch}
            />
          </div>
        </div>
      </div>
    );
  }

  // For paid users, show traditional grid layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6">
        {/* Header with Upload Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <RoleBasedStoreHeader 
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

        {/* Role-Based Filters */}
        <RoleBasedStoreFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          diamonds={diamonds || []}
        />

        {/* Role-Based Store Grid */}
        <RoleBasedStoreGrid
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
