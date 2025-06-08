
import { useState } from "react";
import { Diamond } from "./InventoryTable";
import { DiamondFormData } from "./form/types";
import { useToast } from "@/components/ui/use-toast";

interface InventoryActionsProps {
  allDiamonds: Diamond[];
  addDiamond: (data: DiamondFormData) => Promise<boolean>;
  updateDiamond: (id: string, data: DiamondFormData) => Promise<boolean>;
  deleteDiamond: (id: string, diamond: Diamond) => Promise<boolean>;
  toggleStoreVisibility: (diamond: Diamond) => Promise<boolean>;
  handleRefresh: () => void;
  setIsFormOpen: (open: boolean) => void;
  setEditingDiamond: (diamond: Diamond | null) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setDiamondToDelete: (diamond: Diamond | null) => void;
  setIsQRScannerOpen: (open: boolean) => void;
}

export function useInventoryActions({
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
}: InventoryActionsProps) {
  const { toast } = useToast();

  const handleAddDiamond = () => {
    setEditingDiamond(null);
    setIsFormOpen(true);
  };

  const handleEditDiamond = (diamond: Diamond) => {
    setEditingDiamond(diamond);
    setIsFormOpen(true);
  };

  const handleDeleteDiamond = (diamondId: string) => {
    const diamond = allDiamonds.find(d => d.id === diamondId);
    setDiamondToDelete(diamond || null);
    setDeleteDialogOpen(true);
  };

  const handleToggleStoreVisibility = async (diamond: Diamond) => {
    const success = await toggleStoreVisibility(diamond);
    if (success) {
      handleRefresh();
    }
  };

  const handleFormSubmit = async (editingDiamond: Diamond | null, data: DiamondFormData, setIsFormOpen: (open: boolean) => void, setEditingDiamond: (diamond: Diamond | null) => void) => {
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

  const confirmDelete = async (diamondToDelete: Diamond | null, setDeleteDialogOpen: (open: boolean) => void, setDiamondToDelete: (diamond: Diamond | null) => void) => {
    if (diamondToDelete) {
      const success = await deleteDiamond(diamondToDelete.id, diamondToDelete);
      if (success) {
        setDeleteDialogOpen(false);
        setDiamondToDelete(null);
      }
    }
  };

  const handleQRScan = () => {
    setIsQRScannerOpen(true);
  };

  const handleQRScanSuccess = (giaData: any, setEditingDiamond: (diamond: Diamond | null) => void, setIsQRScannerOpen: (open: boolean) => void, setIsFormOpen: (open: boolean) => void) => {
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

  return {
    handleAddDiamond,
    handleEditDiamond,
    handleDeleteDiamond,
    handleToggleStoreVisibility,
    handleFormSubmit,
    confirmDelete,
    handleQRScan,
    handleQRScanSuccess,
  };
}
