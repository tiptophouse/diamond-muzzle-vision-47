
import { Diamond } from "./InventoryTable";
import { DiamondForm } from "./DiamondForm";
import { DiamondFormData } from "./form/types";
import { QRCodeScanner } from "./QRCodeScanner";
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

interface InventoryDialogsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingDiamond: Diamond | null;
  setEditingDiamond: (diamond: Diamond | null) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  isQRScannerOpen: boolean;
  setIsQRScannerOpen: (open: boolean) => void;
  crudLoading: boolean;
  onFormSubmit: (data: DiamondFormData) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  onQRScanSuccess: (giaData: any) => void;
}

export function InventoryDialogs({
  isFormOpen,
  setIsFormOpen,
  editingDiamond,
  setEditingDiamond,
  deleteDialogOpen,
  setDeleteDialogOpen,
  isQRScannerOpen,
  setIsQRScannerOpen,
  crudLoading,
  onFormSubmit,
  onConfirmDelete,
  onQRScanSuccess,
}: InventoryDialogsProps) {
  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDiamond ? 'Edit Diamond' : 'Add New Diamond'}
            </DialogTitle>
          </DialogHeader>
          <DiamondForm
            diamond={editingDiamond || undefined}
            onSubmit={onFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingDiamond(null);
            }}
            isLoading={crudLoading}
          />
        </DialogContent>
      </Dialog>

      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={onQRScanSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the diamond from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              disabled={crudLoading}
            >
              {crudLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
