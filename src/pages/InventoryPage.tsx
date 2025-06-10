
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { EnhancedDiamondForm } from "@/components/inventory/EnhancedDiamondForm";
import { DiamondFormData } from "@/components/inventory/form/types";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Diamond } from "@/components/inventory/InventoryTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { useToast } from "@/components/ui/use-toast";

export default function InventoryPage() {
  const { isAuthenticated, isLoading: authLoading, user, error: authError } = useTelegramAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diamondToDelete, setDiamondToDelete] = useState<Diamond | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const { toast } = useToast();

  const {
    loading,
    diamonds,
    setDiamonds,
    allDiamonds,
    fetchData,
    handleRefresh,
    handleStoreToggle,
    removeDiamondFromState,
    restoreDiamondToState,
  } = useInventoryData();

  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    handleSearch,
  } = useInventorySearch(allDiamonds, 1, {});

  const { addDiamond, updateDiamond, deleteDiamond, isLoading: crudLoading } = useInventoryCrud({
    onSuccess: handleRefresh,
    removeDiamondFromState,
    restoreDiamondToState,
  });

  useEffect(() => {
    setDiamonds(filteredDiamonds);
  }, [filteredDiamonds, setDiamonds]);

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

  const handleDuplicateDiamond = (diamond: Diamond) => {
    const duplicatedData: DiamondFormData = {
      stockNumber: `${diamond.stockNumber}-COPY`,
      shape: diamond.shape,
      carat: diamond.carat,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      price: diamond.price,
      status: 'Available',
      imageUrl: diamond.imageUrl || '',
      additional_images: diamond.additional_images || [],
      store_visible: diamond.store_visible ?? true,
      fluorescence: diamond.fluorescence || 'None',
      lab: diamond.lab || 'GIA',
      polish: diamond.polish || 'Excellent',
      symmetry: diamond.symmetry || 'Excellent',
      certificate_number: '',
    };

    addDiamond(duplicatedData);
    
    toast({
      title: "Diamond Duplicated! 💎",
      description: `${duplicatedData.stockNumber} has been created as a copy.`,
    });
  };

  const handleBulkEdit = (selectedIds: string[]) => {
    toast({
      title: "Bulk Edit Coming Soon",
      description: `Selected ${selectedIds.length} items for bulk editing.`,
    });
    // TODO: Implement bulk edit functionality
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`);
    if (!confirmDelete) return;

    let successCount = 0;
    for (const id of selectedIds) {
      const diamond = allDiamonds.find(d => d.id === id);
      if (diamond) {
        const success = await deleteDiamond(id, diamond);
        if (success) successCount++;
      }
    }

    toast({
      title: `Deleted ${successCount} items`,
      description: `${successCount} out of ${selectedIds.length} items were successfully deleted.`,
    });
  };

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
      certificate_number: giaData.certificateNumber || '',
      lab: giaData.lab || 'GIA'
    } as Diamond);
    
    setIsQRScannerOpen(false);
    setIsFormOpen(true);
    
    toast({
      title: "GIA Data Loaded",
      description: `Certificate ${giaData.certificateNumber} data has been loaded into the form`,
    });
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
      <div className="w-full max-w-full overflow-x-hidden space-y-6">
        <InventoryHeader
          totalDiamonds={allDiamonds.length}
          onRefresh={handleRefresh}
          onAdd={handleAddDiamond}
          onQRScan={handleQRScan}
          loading={loading}
        />
        
        <InventoryDashboard
          diamonds={diamonds}
          onEdit={handleEditDiamond}
          onDelete={handleDeleteDiamond}
          onDuplicate={handleDuplicateDiamond}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          loading={loading}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingDiamond ? 'Edit Diamond' : 'Add New Diamond'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedDiamondForm
            diamond={editingDiamond || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={crudLoading}
          />
        </DialogContent>
      </Dialog>

      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the diamond from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={crudLoading}
            >
              {crudLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
