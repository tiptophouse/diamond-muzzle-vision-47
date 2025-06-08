
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
import { QRCodeScanner } from "./QRCodeScanner";
import { DiamondForm } from "./DiamondForm";
import { DiamondFormData } from "./form/types";
import { Diamond } from "./InventoryTable";

interface InventoryDialogsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingDiamond: Diamond | null;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  diamondToDelete: Diamond | null;
  isQRScannerOpen: boolean;
  setIsQRScannerOpen: (open: boolean) => void;
  onFormSubmit: (data: DiamondFormData) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  onQRScanSuccess: (giaData: any) => void;
  isLoading: boolean;
}

export function InventoryDialogs({
  isFormOpen,
  setIsFormOpen,
  editingDiamond,
  deleteDialogOpen,
  setDeleteDialogOpen,
  diamondToDelete,
  isQRScannerOpen,
  setIsQRScannerOpen,
  onFormSubmit,
  onConfirmDelete,
  onQRScanSuccess,
  isLoading,
}: InventoryDialogsProps) {
  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDiamond ? 'Edit Diamond' : 'Add New Diamond'}
            </DialogTitle>
          </DialogHeader>
          <DiamondForm
            diamond={editingDiamond || undefined}
            onSubmit={onFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={onQRScanSuccess}
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
              onClick={onConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
