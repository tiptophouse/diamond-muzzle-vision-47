
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useDeleteDiamondFixed } from '@/hooks/inventory/useDeleteDiamondFixed';

interface InventoryItem {
  id: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  lab?: string;
  certificate_number?: number;
  price_per_carat?: number;
  store_visible?: boolean;
  status?: string;
}

interface InventoryTableRowProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onToggleVisibility?: (stockNumber: string, visible: boolean) => void;
  onRefresh?: () => void;
}

export function InventoryTableRow({ 
  item, 
  onEdit, 
  onToggleVisibility,
  onRefresh 
}: InventoryTableRowProps) {
  const { deleteDiamond, isDeleting } = useDeleteDiamondFixed();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = async () => {
    console.log('🗑️ Deleting diamond:', item.stock_number);
    
    const result = await deleteDiamond(item.stock_number, () => {
      // Refresh inventory after successful deletion
      if (onRefresh) {
        onRefresh();
      }
    });

    if (result.success) {
      console.log('✅ Diamond deleted successfully');
      setIsConfirmOpen(false);
    } else {
      console.error('❌ Diamond deletion failed:', result.error);
    }
  };

  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility(item.stock_number, !item.store_visible);
    }
  };

  const isCurrentlyDeleting = isDeleting === item.stock_number;

  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="font-medium">{item.stock_number}</TableCell>
      <TableCell>{item.shape}</TableCell>
      <TableCell>{item.weight.toFixed(2)}</TableCell>
      <TableCell>{item.color}</TableCell>
      <TableCell>{item.clarity}</TableCell>
      <TableCell>{item.cut || '-'}</TableCell>
      <TableCell>{item.lab || '-'}</TableCell>
      <TableCell>{item.certificate_number || '-'}</TableCell>
      <TableCell>
        {item.price_per_carat ? `$${item.price_per_carat.toLocaleString()}` : '-'}
      </TableCell>
      <TableCell>
        <Badge variant={item.status === 'Available' ? 'default' : 'secondary'}>
          {item.status || 'Available'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {onToggleVisibility && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleVisibility}
              title={item.store_visible ? "Hide from store" : "Show in store"}
            >
              {item.store_visible ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          )}
          
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              title="Edit diamond"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isCurrentlyDeleting}
                title="Delete diamond"
              >
                {isCurrentlyDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-600" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Diamond</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete diamond <strong>{item.stock_number}</strong>? 
                  This action cannot be undone and will permanently remove the diamond from your inventory.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isCurrentlyDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isCurrentlyDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Diamond'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
