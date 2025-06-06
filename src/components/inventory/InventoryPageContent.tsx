
import { useEffect } from "react";
import { InventoryTable } from "./InventoryTable";
import { InventoryPagination } from "./InventoryPagination";
import { InventoryPageHeader } from "./InventoryPageHeader";
import { InventoryDialogs } from "./InventoryDialogs";
import { DiamondFormData } from "./form/types";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { useInventoryPageState } from "@/hooks/inventory/useInventoryPageState";
import { Diamond } from "./InventoryTable";
import { useToast } from "@/components/ui/use-toast";

export function InventoryPageContent() {
  const { toast } = useToast();
  
  const {
    currentPage,
    setCurrentPage,
    filters,
    isFormOpen,
    setIsFormOpen,
    editingDiamond,
    setEditingDiamond,
    deleteDialogOpen,
    setDeleteDialogOpen,
    diamondToDelete,
    setDiamondToDelete,
    isQRScannerOpen,
    setIsQRScannerOpen,
    handleFilterChange,
    handleAddDiamond,
    handleEditDiamond,
    handleDeleteDiamond,
    handleQRScan,
  } = useInventoryPageState();

  const {
    loading,
    diamonds,
    setDiamonds,
    allDiamonds,
    handleRefresh,
    removeFromState,
  } = useInventoryData();

  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    totalPages,
    handleSearch,
  } = useInventorySearch(allDiamonds, currentPage, filters);

  const { addDiamond, updateDiamond, deleteDiamond, isLoading: crudLoading } = useInventoryCrud(() => {
    console.log('🔄 CRUD operation success callback triggered');
    handleRefresh(true);
  });

  useEffect(() => {
    setDiamonds(filteredDiamonds);
  }, [filteredDiamonds, setDiamonds]);

  const handleFormSubmit = async (data: DiamondFormData) => {
    let success = false;
    
    if (editingDiamond) {
      success = await updateDiamond(editingDiamond.id, data);
    } else {
      success = await addDiamond(data);
    }

    if (success) {
      setIsFormOpen(false);
      setEditingDiamond(null);
    }
  };

  const confirmDelete = async () => {
    if (diamondToDelete) {
      console.log('🗑️ Confirming deletion for diamond:', diamondToDelete);
      
      removeFromState(diamondToDelete);
      setDeleteDialogOpen(false);
      const diamondIdToDelete = diamondToDelete;
      setDiamondToDelete(null);
      
      toast({
        title: "Deleting...",
        description: "Removing diamond from inventory",
      });
      
      const success = await deleteDiamond(diamondIdToDelete);
      
      if (!success) {
        console.error('❌ Deletion failed, restoring UI state');
        toast({
          variant: "destructive",
          title: "Deletion Failed", 
          description: "Failed to delete diamond. Refreshing inventory...",
        });
        await handleRefresh(true);
      }
    }
  };

  const handleQRScanSuccess = (giaData: any) => {
    console.log('Received GIA data from scanner:', giaData);
    
    setEditingDiamond({
      id: '',
      stockNumber: giaData.stockNumber || `GIA-${Date.now()}`,
      shape: giaData.shape || 'Round',
      carat: giaData.carat || 1.0,
      color: giaData.color || 'G',
      clarity: giaData.clarity || 'VS1',
      cut: giaData.cut || 'Excellent',
      price: giaData.price || 5000,
      status: giaData.status || 'Available',
      imageUrl: giaData.imageUrl || '',
      certificateNumber: giaData.certificateNumber || '',
      lab: giaData.lab || 'GIA'
    } as Diamond);
    
    setIsQRScannerOpen(false);
    setIsFormOpen(true);
    
    toast({
      title: "GIA Data Loaded",
      description: `Certificate ${giaData.certificateNumber} data has been loaded into the form`,
    });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 p-2 sm:p-4">
      <InventoryPageHeader
        totalDiamonds={allDiamonds.length}
        loading={loading}
        searchQuery={searchQuery}
        allDiamonds={allDiamonds}
        onRefresh={() => handleRefresh(false)}
        onAdd={handleAddDiamond}
        onQRScan={handleQRScan}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        onFilterChange={handleFilterChange}
      />
      
      <div className="w-full overflow-x-hidden">
        <InventoryTable
          data={diamonds}
          loading={loading}
          onEdit={handleEditDiamond}
          onDelete={handleDeleteDiamond}
        />
      </div>
      
      <InventoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <InventoryDialogs
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        editingDiamond={editingDiamond}
        setEditingDiamond={setEditingDiamond}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        isQRScannerOpen={isQRScannerOpen}
        setIsQRScannerOpen={setIsQRScannerOpen}
        crudLoading={crudLoading}
        onFormSubmit={handleFormSubmit}
        onConfirmDelete={confirmDelete}
        onQRScanSuccess={handleQRScanSuccess}
      />
    </div>
  );
}
