import { Layout } from "@/components/layout/Layout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { DeleteConfirmDialog } from "@/components/inventory/DeleteConfirmDialog";
import { Toaster } from "@/components/ui/toaster";
import { useSecureInventoryData } from "@/hooks/useSecureInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondForm } from "@/components/inventory/DiamondForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

export default function InventoryPage() {
  const {
    loading,
    diamonds,
    allDiamonds,
    handleRefresh,
    userId,
    error
  } = useSecureInventoryData();

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
      console.log('🔄 CRUD operation completed for user:', userId, 'refreshing inventory...');
      handleRefresh();
    },
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diamondToDelete, setDiamondToDelete] = useState<Diamond | null>(null);

  const handleEdit = (diamond: Diamond) => {
    console.log('📝 Edit diamond clicked:', diamond.stockNumber);
    setEditingDiamond(diamond);
  };

  const handleDelete = async (stockNumber: string) => {
    console.log('🗑️ Delete diamond clicked with stock number:', stockNumber);
    const diamond = allDiamonds.find(d => d.id === stockNumber);
    if (diamond) {
      setDiamondToDelete(diamond);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (diamondToDelete) {
      console.log('🗑️ Confirming delete for diamond:', diamondToDelete.stockNumber);
      const success = await deleteDiamond(diamondToDelete.id, diamondToDelete);
      if (success) {
        console.log('✅ Diamond deleted successfully');
        setDeleteDialogOpen(false);
        setDiamondToDelete(null);
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
      const success = await updateDiamond(editingDiamond.id, data);
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
    }
  };

  // Show error state if user data access fails
  if (error && !loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Access Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <p className="text-muted-foreground">Please ensure you are properly logged in.</p>
        </div>
      </Layout>
    );
  }

  if (loading && allDiamonds.length === 0) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading your inventory securely...</p>
          {userId && <p className="text-xs text-gray-500 mt-2">User ID: {userId}</p>}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <InventoryHeader 
          totalCount={allDiamonds.length}
          onRefresh={handleRefresh}
          loading={loading}
          onAddDiamond={() => {
            console.log('➕ Add diamond button clicked for user:', userId);
            setShowAddForm(true);
          }}
        />
        
        {/* User info display for verification */}
        {userId && process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-800">
              🔒 Secure Mode: Showing inventory for User ID <strong>{userId}</strong>
            </p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-80">
            <div className="space-y-6">
              <InventorySearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSubmit={handleSearch}
                allDiamonds={allDiamonds}
              />
              <InventoryFilters
                onFilterChange={setFilters}
              />
            </div>
          </aside>
          
          <main className="flex-1">
            <div className="space-y-4">
              <InventoryTable
                diamonds={filteredDiamonds}
                loading={loading}
                onRefresh={handleRefresh}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStoreToggle={handleStoreToggle}
              />
              
              <InventoryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </main>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          diamond={diamondToDelete}
          isLoading={crudLoading}
        />

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
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </Layout>
  );
}
