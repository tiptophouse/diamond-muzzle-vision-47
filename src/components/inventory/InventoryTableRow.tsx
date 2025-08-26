
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Diamond } from '@/types/diamond';
import { StoreVisibilityToggle } from './StoreVisibilityToggle';
import { UserImageUpload } from './UserImageUpload';

interface InventoryTableRowProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
  onStoreToggle?: (stockNumber: string, isVisible: boolean) => void;
  onImageUpdate?: () => void;
}

export function InventoryTableRow({ 
  diamond, 
  onEdit, 
  onDelete, 
  onStoreToggle, 
  onImageUpdate 
}: InventoryTableRowProps) {
  const stockNumber = diamond.stockNumber || diamond.stock_number || '';
  const imageUrl = diamond.imageUrl || diamond.picture || diamond.Image || diamond.image;
  const totalPrice = (diamond.price_per_carat || diamond.price || 0) * (diamond.carat || diamond.weight || 1);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(diamond);
    }
  };

  const handleDelete = () => {
    if (onDelete && diamond.id) {
      onDelete(diamond.id);
    }
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-mono text-sm">
        {stockNumber}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={stockNumber}
              className="w-8 h-8 rounded object-cover"
              loading="lazy"
            />
          )}
          <div>
            <div className="font-medium">{diamond.shape}</div>
            <div className="text-sm text-muted-foreground">
              {diamond.carat || diamond.weight}ct
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            {diamond.color}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {diamond.clarity}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            {diamond.cut}
          </div>
          <div className="text-xs text-muted-foreground">
            {diamond.polish} / {diamond.symmetry}
          </div>
        </div>
      </TableCell>

      <TableCell className="text-right">
        <div className="space-y-1">
          <div className="font-medium">
            ${(diamond.price_per_carat || 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Total: ${totalPrice.toLocaleString()}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant={diamond.store_visible ? "default" : "secondary"}>
          {diamond.store_visible ? "Visible" : "Hidden"}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <UserImageUpload 
            diamond={diamond} 
            onUpdate={onImageUpdate || (() => {})} 
          />

          <StoreVisibilityToggle
            diamond={diamond}
            onToggle={onStoreToggle}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
            title="Delete Diamond"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
