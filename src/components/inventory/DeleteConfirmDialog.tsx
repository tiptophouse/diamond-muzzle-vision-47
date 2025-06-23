
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
import { Diamond } from "./InventoryTable";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  diamond: Diamond | null;
  isLoading: boolean;
}

export function DeleteConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  diamond, 
  isLoading 
}: DeleteConfirmDialogProps) {
  if (!diamond) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Diamond</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this diamond?
            <div className="mt-3 p-3 bg-gray-50 rounded-md border text-sm space-y-1">
              <div><strong>Stock #:</strong> {diamond.stockNumber}</div>
              <div><strong>Details:</strong> {diamond.carat}ct {diamond.color}-{diamond.clarity} {diamond.shape}</div>
              <div><strong>Price:</strong> ${diamond.price.toLocaleString()}</div>
            </div>
            <div className="mt-3 text-red-600 font-medium">
              This action cannot be undone and will permanently remove the diamond from your inventory.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Diamond"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
