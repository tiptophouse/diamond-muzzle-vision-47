
import { memo, useState, useCallback, useMemo } from "react";
import { TelegramMiniAppLayout } from "@/components/layout/TelegramMiniAppLayout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryTableView } from "@/components/inventory/InventoryTableView";
import { InventoryViewToggle } from "@/components/inventory/InventoryViewToggle";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { useOptimizedDelete } from "@/hooks/useOptimizedDelete";
import { useInventoryState } from "@/hooks/inventory/useInventoryState";
import { DiamondForm } from "@/components/inventory/DiamondForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Diamond } from "@/components/inventory/InventoryTable";
import { UploadSuccessCard } from "@/components/upload/UploadSuccessCard";

export default function InventoryPage() {
  const {
    loading,
    diamonds,
    allDiamonds,
    handleRefresh,
    error,
  } = useInventoryData();

  const {
    diamonds: stateDiamonds,
    allDiamonds: stateAllDiamonds,
    removeDiamondFromState,
    restoreDiamondToState,
    updateDiamonds
  } = useInventoryState();

  // Use state diamonds if available, otherwise use fetched diamonds
  const displayDiamonds = stateAllDiamonds.length > 0 ? stateAllDiamonds : allDiamonds;
  const currentDiamonds = stateDiamonds.length > 0 ? stateDiamonds : diamonds;

  // Update state when new data arrives
  useMemo(() => {
    if (allDiamonds.length > 0 && stateAllDiamonds.length === 0) {
      updateDiamonds(allDiamonds);
    }
  }, [allDiamonds, stateAllDiamonds.length, updateDiamonds]);

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    totalPages,
    handleSearch,
  } = useInventorySearch(displayDiamonds, currentPage, filters);

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
    removeDiamondFromState,
    restoreDiamondToState,
  });

  // Optimized delete with better UX
  const { handleDelete: optimizedDelete } = useOptimizedDelete({
    onDelete: deleteDiamond,
    onOptimisticRemove: removeDiamondFromState,
    onOptimisticRestore: restoreDiamondToState,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

  const handleEdit = useCallback((diamond: Diamond) => {
    console.log('📝 Edit diamond clicked:', diamond.stockNumber);
    setEditingDiamond(diamond);
  }, []);

  const handleDelete = useCallback(async (diamondId: string) => {
    console.log('🗑️ Delete diamond clicked:', diamondId);
    if (window.confirm('Are you sure you want to delete this diamond?')) {
      // Find diamond by either diamondId (FastAPI) or id (local)
      const diamond = displayDiamonds.find(d => d.diamondId === diamondId || d.id === diamondId);
      console.log('🗑️ Deleting diamond:', diamond?.stockNumber, 'FastAPI ID:', diamond?.diamondId, 'Local ID:', diamond?.id);
      
      await optimizedDelete(diamondId, diamond);
    }
  }, [displayDiamonds, optimizedDelete]);

  const handleStoreToggle = useCallback(async (stockNumber: string, isVisible: boolean) => {
    console.log('👁️ Store visibility toggle:', stockNumber, isVisible);
    const diamond = displayDiamonds.find(d => d.stockNumber === stockNumber);
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
  }, [displayDiamonds, updateDiamond]);

  const handleEditSubmit = useCallback(async (data: any) => {
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
  }, [editingDiamond, updateDiamond]);

  const handleAddSubmit = useCallback(async (data: any) => {
    console.log('➕ Adding new diamond:', data);
    const success = await addDiamond(data);
    if (success) {
      console.log('✅ Diamond added successfully');
      setShowAddForm(false);
      setShowAddSuccess(true);
    } else {
      console.error('❌ Failed to add diamond from inventory page');
    }
  }, [addDiamond]);

  const handleAddDiamond = useCallback(() => {
    console.log('➕ Add diamond button clicked');
    setShowAddForm(true);
  }, []);

  // Memoize the loading state to prevent unnecessary re-renders
  const isInitialLoading = useMemo(() => loading && displayDiamonds.length === 0, [loading, displayDiamonds.length]);

  if (isInitialLoading) {
    return (
      <TelegramMiniAppLayout>
        <div className="text-center py-8">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
            </div>
            <p className="text-muted-foreground text-sm">Loading inventory...</p>
          </div>
        </div>
      </TelegramMiniAppLayout>
    );
  }

  return (
    <TelegramMiniAppLayout>
      <div className="p-4 space-y-4 max-w-full overflow-hidden">
        {/* Error Alert */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h3 className="text-destructive font-semibold mb-2">Could not load inventory</h3>
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
              >
                Retry
              </button>
              <a
                href="https://t.me/BrilliantBotMazalVision_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
              >
                Open in Telegram
              </a>
            </div>
          </div>
        )}
        
        <InventoryHeader 
          totalCount={displayDiamonds.length}
          onRefresh={handleRefresh}
          loading={loading}
          onAddDiamond={handleAddDiamond}
        />
        
        <div className="space-y-4 w-full">
          <InventorySearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSubmit={handleSearch}
            allDiamonds={displayDiamonds}
            data-tutorial="inventory-search"
          />
          <InventoryFilters
            onFilterChange={setFilters}
          />
          
          <div className="flex justify-between items-center mb-4">
            <InventoryViewToggle 
              view={viewType} 
              onViewChange={setViewType} 
            />
          </div>
          
          <div className="w-full">
            {viewType === 'table' ? (
              <InventoryTableView
                diamonds={filteredDiamonds}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStoreToggle={handleStoreToggle}
              />
            ) : (
        <InventoryTable
          data={filteredDiamonds}
          loading={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStoreToggle={handleStoreToggle}
          onImageUpdate={handleRefresh}
          data-tutorial="inventory-table"
        />
            )}
            
            <InventoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
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
    </TelegramMiniAppLayout>
  );
}
