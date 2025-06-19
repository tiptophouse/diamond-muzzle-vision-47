import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { StoreHeader } from "@/components/store/StoreHeader";
import { PremiumStoreFilters } from "@/components/store/PremiumStoreFilters";
import { ModernStoreGrid } from "@/components/store/ModernStoreGrid";
import { ImageUpload } from "@/components/store/ImageUpload";
import { FloatingShareButton } from "@/components/store/FloatingShareButton";
import { StoreCustomization } from "@/components/store/StoreCustomization";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image, ArrowLeft, Settings, Palette } from "lucide-react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showUpload, setShowUpload] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const { user } = useTelegramAuth();
  const { isSubscribed } = useSubscriptionStatus();
  const navigate = useNavigate();

  // Check if current user is store admin
  const isStoreAdmin = user && isSubscribed;

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Image uploaded to store:', imageUrl);
    setShowUpload(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Back to Main Menu Button */}
      <div className="flex items-center justify-between pt-4 pb-2 px-4 lg:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-white/80 rounded-xl"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Back to Menu</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Admin Controls */}
        {isStoreAdmin && (
          <div className="flex gap-2">
            <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white/80 hover:bg-white border-purple-200 text-purple-700"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Customize Store</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Store Customization
                  </DialogTitle>
                </DialogHeader>
                <StoreCustomization onClose={() => setShowCustomization(false)} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <StoreHeader 
              totalDiamonds={filteredDiamonds.length}
              onOpenFilters={() => {}}
            />
            <p className="text-gray-600 text-sm">
              Discover premium certified diamonds with detailed specifications
            </p>
          </div>
          
          {isStoreAdmin && (
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  <Upload className="h-5 w-5" />
                  <span>Upload Diamond Photo</span>
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
          )}
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

        {/* Modern Store Grid */}
        <ModernStoreGrid
          diamonds={filteredDiamonds}
          loading={loading}
          error={error}
          onUpdate={refetch}
          storeOwnerId={user?.id}
        />
      </div>

      {/* Floating Share Button */}
      <FloatingShareButton />
    </div>
  );
}
