
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondForm } from "@/components/inventory/DiamondForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { UploadSuccessCard } from "@/components/upload/UploadSuccessCard";

export default function InventoryPage() {
  const {
    loading,
    diamonds,
    allDiamonds,
    handleRefresh,
  } = useInventoryData();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    totalPages,
    handleSearch,
  } = useInventorySearch(allDiamonds, currentPage, filters);

  const { 
    addDiamond,
    updateDiamond, 
    deleteDiamond,
    isLoading: crudLoading 
  } = useInventoryCrud({
    onSuccess: () => {
      console.log('🔄 CRUD operation completed, refreshing inventory...');
      handleRefresh();
    },
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const handleEdit = (diamond: Diamond) => {
    console.log('📝 Edit diamond clicked:', diamond.stockNumber);
    setEditingDiamond(diamond);
  };

  const handleDelete = async (diamondId: string) => {
    console.log('🗑️ Delete diamond clicked:', diamondId);
    if (window.confirm('Are you sure you want to delete this diamond?')) {
      const diamond = allDiamonds.find(d => d.id === diamondId);
      console.log('🗑️ Deleting diamond:', diamond?.stockNumber, 'Diamond ID:', diamond?.diamondId);
      
      const success = await deleteDiamond(diamondId, diamond);
      if (success) {
        console.log('✅ Diamond deleted successfully');
      } else {
        console.error('❌ Failed to delete diamond');
      }
    }
  };

  const handleStoreToggle = async (stockNumber: string, isVisible: boolean) => {
    console.log('👁️ Store visibility toggle:', stockNumber, isVisible);
    const diamond = allDiamonds.find(d => d.stockNumber === stockNumber);
    if (diamond) {
      const updateData = {
        stockNumber: diamond.stockNumber,
        shape: diamond.shape,
        carat: diamond.carat,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        price: diamond.price,
        status: diamond.status,
        storeVisible: isVisible,
        certificateNumber: diamond.certificateNumber,
        certificateUrl: diamond.certificateUrl,
        lab: diamond.lab,
      };
      
      const success = await updateDiamond(diamond.id, updateData);
      if (success) {
        console.log('✅ Store visibility updated successfully');
      }
    }
  };

  const handleEditSubmit = async (data: any) => {
    console.log('💾 Saving edited diamond:', data);
    if (editingDiamond) {
      // Use the FastAPI diamond ID if available for the update
      const diamondIdToUpdate = editingDiamond.diamondId?.toString() || editingDiamond.id;
      console.log('📝 Using diamond ID for update:', diamondIdToUpdate);
      
      const success = await updateDiamond(diamondIdToUpdate, data);
      if (success) {
        console.log('✅ Diamond updated successfully');
        setEditingDiamond(null);
      }
    }
  };

  const handleAddSubmit = async (data: any) => {
    console.log('➕ Adding new diamond:', data);
    const success = await addDiamond(data);
    if (success) {
      console.log('✅ Diamond added successfully');
      setShowAddForm(false);
      setShowAddSuccess(true);
    } else {
      console.error('❌ Failed to add diamond from inventory page');
    }
  };

  if (loading && allDiamonds.length === 0) {
    return (
      <TelegramLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="space-y-6">
        <InventoryHeader 
          totalCount={allDiamonds.length}
          onRefresh={handleRefresh}
          loading={loading}
          onAddDiamond={() => {
            console.log('➕ Add diamond button clicked');
            setShowAddForm(true);
          }}
        />
        
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-80">
        <div className="space-y-6">
          <InventorySearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSubmit={handleSearch}
            allDiamonds={allDiamonds}
            data-tutorial="inventory-search"
          />
          <InventoryFilters
            onFilterChange={setFilters}
          />
        </div>
          </aside>
          
          <main className="flex-1">
            <div className="space-y-4">
              <InventoryTable
                data={filteredDiamonds}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStoreToggle={handleStoreToggle}
                onImageUpdate={handleRefresh}
                data-tutorial="inventory-table"
              />
              
              <InventoryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </main>
        </div>

        {/* Edit Diamond Modal */}
        <Dialog open={!!editingDiamond} onOpenChange={() => setEditingDiamond(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Diamond - #{editingDiamond?.stockNumber}</DialogTitle>
            </DialogHeader>
            {editingDiamond && (
              <DiamondForm
                diamond={editingDiamond}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditingDiamond(null)}
                isLoading={crudLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add Diamond Modal */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Diamond</DialogTitle>
            </DialogHeader>
            <DiamondForm
              onSubmit={handleAddSubmit}
              onCancel={() => setShowAddForm(false)}
              isLoading={crudLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Add Success Modal */}
        <Dialog open={showAddSuccess} onOpenChange={setShowAddSuccess}>
          <DialogContent className="max-w-md border-none bg-transparent shadow-none">
            <UploadSuccessCard
              title="Diamond Added Successfully"
              description="Your diamond has been added to your inventory and is ready to share."
              onContinue={() => setShowAddSuccess(false)}
              onShare={() => {
                setShowAddSuccess(false);
                // Could navigate to store or show share options
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TelegramLayout>
  );
}
