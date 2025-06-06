
import { useState } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

export function useInventoryPageState() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diamondToDelete, setDiamondToDelete] = useState<string | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleAddDiamond = () => {
    setEditingDiamond(null);
    setIsFormOpen(true);
  };

  const handleEditDiamond = (diamond: Diamond) => {
    setEditingDiamond(diamond);
    setIsFormOpen(true);
  };

  const handleDeleteDiamond = (diamondId: string) => {
    console.log('🗑️ Delete button clicked for diamond:', diamondId);
    setDiamondToDelete(diamondId);
    setDeleteDialogOpen(true);
  };

  const handleQRScan = () => {
    setIsQRScannerOpen(true);
  };

  return {
    currentPage,
    setCurrentPage,
    filters,
    setFilters,
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
  };
}
