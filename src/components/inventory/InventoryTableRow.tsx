
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useDeleteDiamond } from '@/hooks/inventory/useDeleteDiamond';
import { useToast } from '@/hooks/use-toast';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const { deleteDiamond, isLoading: isDeleteLoading } = useDeleteDiamond({
    onSuccess: () => {
      if (onRefresh) {
        onRefresh();
      }
    }
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteDiamond(item.id);
      if (success) {
        toast({
          title: "Success",
          description: `Diamond ${item.stock_number} deleted successfully`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete diamond ${item.stock_number}`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the diamond",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility(item.stock_number, !item.store_visible);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{item.stock_number}</TableCell>
      <TableCell>{item.shape}</TableCell>
      <TableCell>{item.weight.toFixed(2)}</TableCell>
      <TableCell>{item.color}</TableCell>
      <TableCell>{item.clarity}</TableCell>
      <TableCell>{item.cut || '-'}</TableCell>
      <TableCell>{item.lab || '-'}</TableCell>
      <TableCell>{item.certificate_number || '-'}</TableCell>
      <TableCell>{formatPrice(item.price_per_carat)}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'Available' 
            ? 'bg-green-100 text-green-800' 
            : item.status === 'Sold' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {item.status || 'Available'}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="h-8 w-8 p-0"
              title="Edit diamond"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleVisibility}
            className={`h-8 w-8 p-0 ${
              item.store_visible 
                ? 'text-green-600 hover:bg-green-100' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={item.store_visible ? 'Hide from store' : 'Show in store'}
          >
            {item.store_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                title="Delete diamond"
                disabled={isDeleteLoading || isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Diamond</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete diamond <strong>{item.stock_number}</strong>? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleteLoading || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
