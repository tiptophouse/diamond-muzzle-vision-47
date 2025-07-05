
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Diamond } from "./InventoryTable";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diamond: Diamond | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmationDialog({ 
  open, 
  onOpenChange, 
  diamond, 
  onConfirm, 
  isDeleting = false 
}: DeleteConfirmationDialogProps) {
  if (!diamond) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Delete Diamond
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 mt-2">
            Are you sure you want to permanently delete this diamond from your inventory?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {diamond.carat} ct {diamond.shape}
              </p>
              <p className="text-sm text-gray-600">
                Stock #{diamond.stockNumber} • {diamond.color}-{diamond.clarity}
              </p>
              <p className="text-sm font-medium text-green-600">
                ${diamond.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ This action cannot be undone
          </p>
          <p className="text-xs text-red-600 mt-1">
            The diamond will be permanently removed from your inventory and all systems.
          </p>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Diamond
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
