
import { useEffect, useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { InventoryDialogs } from "@/components/inventory/InventoryDialogs";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryHandlers } from "@/hooks/useInventoryHandlers";

export function InventoryContainer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const {
    loading,
    diamonds,
    setDiamonds,
    allDiamonds,
    handleRefresh,
  } = useInventoryData();

  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    totalPages,
    handleSearch,
  } = useInventorySearch(allDiamonds, currentPage, filters);

  const {
    isFormOpen,
    setIsFormOpen,
    editingDiamond,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isQRScannerOpen,
    setIsQRScannerOpen,
    crudLoading,
    handleAddDiamond,
    handleEditDiamond,
    handleDeleteDiamond,
    handleFormSubmit,
    confirmDelete,
    handleQRScan,
    handleQRScanSuccess,
  } = useInventoryHandlers(handleRefresh);

  useEffect(() => {
    setDiamonds(filteredDiamonds);
  }, [filteredDiamonds, setDiamonds]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="w-full max-w-full overflow-x-hidden space-y-4">
        <InventoryHeader
          totalDiamonds={allDiamonds.length}
          onRefresh={handleRefresh}
          onAdd={handleAddDiamond}
          onQRScan={handleQRScan}
          loading={loading}
        />
        
        <div className="w-full space-y-4">
          <InventorySearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSubmit={handleSearch}
          />
          
          <InventoryFilters onFilterChange={handleFilterChange} />
        </div>
        
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
      </div>

      <InventoryDialogs
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        editingDiamond={editingDiamond}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        isQRScannerOpen={isQRScannerOpen}
        setIsQRScannerOpen={setIsQRScannerOpen}
        crudLoading={crudLoading}
        onFormSubmit={handleFormSubmit}
        onConfirmDelete={confirmDelete}
        onQRScanSuccess={handleQRScanSuccess}
      />
    </>
  );
}
