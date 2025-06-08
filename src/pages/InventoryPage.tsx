
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { useStoreVisibilityToggle } from "@/hooks/useStoreVisibilityToggle";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Diamond } from "@/components/inventory/InventoryTable";
import { InventoryContent } from "@/components/inventory/InventoryContent";
import { InventoryDialogs } from "@/components/inventory/InventoryDialogs";
import { useInventoryActions } from "@/components/inventory/InventoryActions";

export default function InventoryPage() {
  const { isAuthenticated, isLoading: authLoading, user, error: authError } = useTelegramAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diamondToDelete, setDiamondToDelete] = useState<Diamond | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const {
    loading,
    diamonds,
    setDiamonds,
    allDiamonds,
    fetchData,
    handleRefresh,
    removeDiamondFromState,
    restoreDiamondToState,
  } = useInventoryData();

  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    totalPages,
    handleSearch,
  } = useInventorySearch(allDiamonds, currentPage, filters);

  const { addDiamond, updateDiamond, deleteDiamond, isLoading: crudLoading } = useInventoryCrud({
    onSuccess: handleRefresh,
    removeDiamondFromState,
    restoreDiamondToState,
  });

  const { toggleStoreVisibility } = useStoreVisibilityToggle();

  const {
    handleAddDiamond,
    handleEditDiamond,
    handleDeleteDiamond,
    handleToggleStoreVisibility,
    handleFormSubmit,
    confirmDelete,
    handleQRScan,
    handleQRScanSuccess,
  } = useInventoryActions({
    allDiamonds,
    addDiamond,
    updateDiamond,
    deleteDiamond,
    toggleStoreVisibility,
    handleRefresh,
    setIsFormOpen,
    setEditingDiamond,
    setDeleteDialogOpen,
    setDiamondToDelete,
    setIsQRScannerOpen,
  });

  useEffect(() => {
    setDiamonds(filteredDiamonds);
  }, [filteredDiamonds, setDiamonds]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const onFormSubmit = async (data: any) => {
    await handleFormSubmit(editingDiamond, data, setIsFormOpen, setEditingDiamond);
  };

  const onConfirmDelete = async () => {
    await confirmDelete(diamondToDelete, setDeleteDialogOpen, setDiamondToDelete);
  };

  const onQRScanSuccess = (giaData: any) => {
    handleQRScanSuccess(giaData, setEditingDiamond, setIsQRScannerOpen, setIsFormOpen);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Authenticating...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || authError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 w-full">
          <div className="text-center px-4">
            <p className="text-red-600 mb-4">
              {authError || "Authentication required to view inventory"}
            </p>
            <p className="text-slate-600">Please ensure you're accessing this app through Telegram.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <InventoryContent
        diamonds={diamonds}
        allDiamonds={allDiamonds}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        onFilterChange={handleFilterChange}
        onEdit={handleEditDiamond}
        onDelete={handleDeleteDiamond}
        onToggleStoreVisibility={handleToggleStoreVisibility}
        onRefresh={handleRefresh}
        onAdd={handleAddDiamond}
        onQRScan={handleQRScan}
        handleSearch={handleSearch}
      />

      <InventoryDialogs
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        editingDiamond={editingDiamond}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        diamondToDelete={diamondToDelete}
        isQRScannerOpen={isQRScannerOpen}
        setIsQRScannerOpen={setIsQRScannerOpen}
        onFormSubmit={onFormSubmit}
        onConfirmDelete={onConfirmDelete}
        onQRScanSuccess={onQRScanSuccess}
        isLoading={crudLoading}
      />
    </Layout>
  );
}
