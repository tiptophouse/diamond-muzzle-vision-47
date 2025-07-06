import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BulkDeleteButtonProps {
  selectedCount: number;
  onBulkDelete: () => void;
  isLoading?: boolean;
}

export function BulkDeleteButton({ selectedCount, onBulkDelete, isLoading }: BulkDeleteButtonProps) {
  if (selectedCount === 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete {selectedCount} selected
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Selected Diamonds</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedCount} selected diamond{selectedCount === 1 ? '' : 's'}? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onBulkDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}