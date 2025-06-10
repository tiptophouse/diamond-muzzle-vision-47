
import { Layout } from "@/components/layout/Layout";
import { PremiumStoreHeader } from "@/components/store/PremiumStoreHeader";
import { OptimizedStoreGrid } from "@/components/premium/OptimizedStoreGrid";
import { EnhancedStoreFilters } from "@/components/store/EnhancedStoreFilters";
import { useHybridInventory } from "@/hooks/useHybridInventory";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnhancedDiamondForm } from "@/components/inventory/EnhancedDiamondForm";
import { DiamondFormData } from "@/components/inventory/form/types";

export default function StorePage() {
  const { user } = useTelegramAuth();
  const isManager = user?.id === 101;
  
  const { 
    diamonds, 
    loading, 
    error,
    addLocalDiamond,
    refreshData 
  } = useHybridInventory();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingDiamond, setIsAddingDiamond] = useState(false);

  const {
    filteredDiamonds,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    handleFilterChange,
    clearFilters
  } = useStoreFilters(diamonds);

  const handleAddDiamond = async (data: DiamondFormData) => {
    setIsAddingDiamond(true);
    try {
      const success = await addLocalDiamond({
        stockNumber: data.stockNumber,
        shape: data.shape,
        carat: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: data.price,
        status: data.status,
        imageUrl: data.imageUrl,
        store_visible: data.store_visible,
        fluorescence: data.fluorescence,
        lab: data.lab,
        certificate_number: data.certificate_number,
        polish: data.polish,
        symmetry: data.symmetry,
      });
      
      if (success) {
        setIsAddDialogOpen(false);
      }
    } finally {
      setIsAddingDiamond(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Premium header with glass morphism effect */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
          <PremiumStoreHeader
            totalDiamonds={filteredDiamonds.length}
            onOpenFilters={() => setShowFilters(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop filters sidebar with premium styling */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-32">
                <EnhancedStoreFilters
                  onUpdateFilter={handleFilterChange}
                  onClearFilters={clearFilters}
                  totalDiamonds={diamonds.length}
                  filteredCount={filteredDiamonds.length}
                />
              </div>
            </div>

            {/* Main content with enhanced spacing */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Manager Controls */}
              {isManager && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Store Management</h2>
                      <p className="text-blue-100">Add and manage your diamond inventory</p>
                    </div>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Diamond
                    </Button>
                  </div>
                </div>
              )}

              {/* Store grid with premium animations */}
              <OptimizedStoreGrid
                diamonds={filteredDiamonds}
                loading={loading}
                error={error}
                onUpdate={refreshData}
              />
            </div>
          </div>
        </div>

        {/* Mobile filters modal with premium styling */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Filter & Search</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <EnhancedStoreFilters
                  onUpdateFilter={handleFilterChange}
                  onClearFilters={clearFilters}
                  totalDiamonds={diamonds.length}
                  filteredCount={filteredDiamonds.length}
                  isMobile
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Diamond Dialog */}
        {isManager && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Diamond to Store
                </DialogTitle>
              </DialogHeader>
              <EnhancedDiamondForm
                onSubmit={handleAddDiamond}
                onCancel={() => setIsAddDialogOpen(false)}
                isLoading={isAddingDiamond}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
