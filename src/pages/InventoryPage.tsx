import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { DiamondForm } from "@/components/inventory/DiamondForm";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diamondToDelete, setDiamondToDelete] = useState<string | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const { toast } = useToast();

  const {
    loading,
    diamonds,
    setDiamonds,
    allDiamonds,
    fetchData,
    handleRefresh,
  } = useInventoryData();

  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    totalPages,
    handleSearch,
  } = useInventorySearch(allDiamonds, currentPage, filters);

  const { addDiamond, updateDiamond, deleteDiamond, isLoading: crudLoading } = useInventoryCrud(handleRefresh);

  useEffect(() => {
    setDiamonds(filteredDiamonds);
  }, [filteredDiamonds, setDiamonds]);

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
    setDiamondToDelete(diamondId);
    setDeleteDialogOpen(true);
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
      const success = await deleteDiamond(diamondToDelete);
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
    
    // Set the diamond data to be used in the form
    setEditingDiamond({
      id: '', // Will be generated when saving
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
    
    // Close scanner and open form with populated data
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
            allDiamonds={allDiamonds}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDiamond ? 'Edit Diamond' : 'Add New Diamond'}
            </DialogTitle>
          </DialogHeader>
          <DiamondForm
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
