
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoreVisibilityToggle } from "./StoreVisibilityToggle";
import { Diamond } from "./InventoryTable";
import { Edit, Trash2, ExternalLink, FileImage } from "lucide-react";
import { useDeleteDiamondFixed } from "@/hooks/inventory/useDeleteDiamondFixed";
import { useState } from "react";
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

interface InventoryTableRowProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
  onStoreToggle?: (stockNumber: string, isVisible: boolean) => void;
}

export function InventoryTableRow({ diamond, onEdit, onDelete, onStoreToggle }: InventoryTableRowProps) {
  const { deleteDiamond, isLoading: isDeleting } = useDeleteDiamondFixed();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteDiamond(diamond.id);
      if (onDelete) {
        onDelete(diamond.id);
      }
    } catch (error) {
      console.error('Failed to delete diamond:', error);
    }
    setShowDeleteDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-medium">{diamond.stockNumber}</TableCell>
        <TableCell>{diamond.shape}</TableCell>
        <TableCell>{diamond.carat.toFixed(2)}</TableCell>
        <TableCell>{diamond.color}</TableCell>
        <TableCell>{diamond.clarity}</TableCell>
        <TableCell>{diamond.cut}</TableCell>
        <TableCell>${diamond.price.toLocaleString()}</TableCell>
        <TableCell>
          <Badge className={getStatusColor(diamond.status)}>
            {diamond.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {diamond.imageUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={diamond.imageUrl} target="_blank" rel="noopener noreferrer">
                  <FileImage className="h-4 w-4" />
                </a>
              </Button>
            )}
            {diamond.certificateUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </TableCell>
        <TableCell>
          <StoreVisibilityToggle
            isVisible={diamond.store_visible || false}
            onToggle={(isVisible) => onStoreToggle?.(diamond.stockNumber, isVisible)}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(diamond)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diamond</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the diamond with stock number "{diamond.stockNumber}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
