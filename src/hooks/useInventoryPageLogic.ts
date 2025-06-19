
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { Diamond } from "@/components/inventory/InventoryTable";

export function useInventoryPageLogic() {
  const { toast } = useToast();
  const {
    loading,
    diamonds,
    allDiamonds,
    handleRefresh,
    removeDiamondFromState,
    restoreDiamondToState,
  } = useInventoryData();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);

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
    removeDiamondFromState,
    restoreDiamondToState,
  });

  const handleEdit = useCallback((diamond: Diamond) => {
    console.log('📝 Edit diamond clicked:', diamond.stockNumber);
    setEditingDiamond(diamond);
  }, []);

  const handleDelete = useCallback(async (diamondId: string) => {
    console.log('🗑️ Delete diamond clicked for ID:', diamondId);
    
    const diamond = allDiamonds.find(d => d.id === diamondId);
    if (!diamond) {
      console.error('❌ Diamond not found for deletion:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Diamond not found",
      });
      return;
    }

    console.log('🗑️ Found diamond for deletion:', {
      id: diamond.id,
      stockNumber: diamond.stockNumber,
      shape: diamond.shape,
      carat: diamond.carat
    });
    
    if (window.confirm(`Are you sure you want to delete diamond ${diamond.stockNumber}?`)) {
      console.log('🗑️ User confirmed deletion of:', diamond.stockNumber);
      
      const success = await deleteDiamond(diamondId, diamond);
      if (success) {
        console.log('✅ Diamond deleted successfully:', diamond.stockNumber);
      } else {
        console.error('❌ Failed to delete diamond:', diamond.stockNumber);
      }
    } else {
      console.log('🚫 User cancelled deletion of:', diamond.stockNumber);
    }
  }, [allDiamonds, deleteDiamond, toast]);

  const handleStoreToggle = useCallback(async (stockNumber: string, isVisible: boolean) => {
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
  }, [allDiamonds, updateDiamond]);

  const handleEditSubmit = useCallback(async (data: any) => {
    console.log('💾 Saving edited diamond:', data);
    if (editingDiamond) {
      const success = await updateDiamond(editingDiamond.id, data);
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
    }
  }, [addDiamond]);

  const handleAddDiamond = useCallback(() => {
    console.log('➕ Add diamond button clicked');
    setShowAddForm(true);
  }, []);

  return {
    // Data
    loading,
    diamonds,
    allDiamonds,
    filteredDiamonds,
    totalPages,
    currentPage,
    filters,
    searchQuery,
    showAddForm,
    editingDiamond,
    crudLoading,
    
    // Actions
    handleRefresh,
    setCurrentPage,
    setFilters,
    setSearchQuery,
    handleSearch,
    handleEdit,
    handleDelete,
    handleStoreToggle,
    handleEditSubmit,
    handleAddSubmit,
    handleAddDiamond,
    setShowAddForm,
    setEditingDiamond,
  };
}
