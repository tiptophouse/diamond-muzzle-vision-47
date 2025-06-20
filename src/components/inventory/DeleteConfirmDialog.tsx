
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
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <strong>Stock #:</strong> {diamond.stockNumber}<br/>
              <strong>Details:</strong> {diamond.carat}ct {diamond.color}-{diamond.clarity} {diamond.shape}
            </div>
            This action cannot be undone and will permanently remove the diamond from your inventory.
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
