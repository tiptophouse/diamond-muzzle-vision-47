
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { EnhancedDiamondForm } from "@/components/inventory/EnhancedDiamondForm";
import { DiamondFormData } from "@/components/inventory/form/types";
import { useOptimizedPostgresInventory } from "@/hooks/useOptimizedPostgresInventory";
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

  // Using the new optimized PostgreSQL inventory hook
  const {
    diamonds,
    loading,
    error,
    createDiamond,
    updateDiamond,
    deleteDiamond,
    bulkDelete,
    refreshInventory,
  } = useOptimizedPostgresInventory();

  const handleAddDiamond = () => {
    setEditingDiamond(null);
    setIsFormOpen(true);
  };

  const handleEditDiamond = (diamond: Diamond) => {
    setEditingDiamond(diamond);
    setIsFormOpen(true);
  };

  const handleDeleteDiamond = (diamondId: string) => {
    const diamond = diamonds.find(d => d.id === diamondId);
    setDiamondToDelete(diamond || null);
    setDeleteDialogOpen(true);
  };

  const handleDuplicateDiamond = async (diamond: Diamond) => {
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

    const success = await createDiamond(duplicatedData);
    
    if (success) {
      toast({
        title: "Diamond Duplicated! 💎",
        description: `${duplicatedData.stockNumber} has been created as a copy.`,
      });
    }
  };

  const handleBulkEdit = (selectedIds: string[]) => {
    toast({
      title: "Bulk Edit Coming Soon",
      description: `Selected ${selectedIds.length} items for bulk editing.`,
    });
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`);
    if (!confirmDelete) return;

    const success = await bulkDelete(selectedIds);
    
    if (success) {
      toast({
        title: `Deleted ${selectedIds.length} items`,
        description: `Successfully deleted ${selectedIds.length} items from inventory.`,
      });
    }
  };

  const handleFormSubmit = async (data: DiamondFormData) => {
    let success = false;
    
    if (editingDiamond) {
      success = await updateDiamond(editingDiamond.id, data);
    } else {
      success = await createDiamond(data);
    }

    if (success) {
      setIsFormOpen(false);
      setEditingDiamond(null);
    }
  };

  const confirmDelete = async () => {
    if (diamondToDelete) {
      const success = await deleteDiamond(diamondToDelete.id);
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
          totalDiamonds={diamonds.length}
          onRefresh={refreshInventory}
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

        {/* Add sample data button if no diamonds exist */}
        {!loading && diamonds.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No Diamonds Found</h3>
              <p className="text-blue-700 mb-4">Your inventory is empty. Add your first diamond to get started!</p>
              <button
                onClick={handleAddDiamond}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Diamond
              </button>
            </div>
          </div>
        )}
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
            isLoading={loading}
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
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
