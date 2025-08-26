
import React from 'react';
import { Diamond } from '@/types/diamond';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';

interface InventoryTableRowProps {
  diamond: Diamond & { store_visible?: boolean; picture?: string };
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamond: Diamond) => void;
  onToggleVisibility: (diamond: Diamond) => void;
  onViewDetails: (diamond: Diamond) => void;
}

export function InventoryTableRow({
  diamond,
  onEdit,
  onDelete,
  onToggleVisibility,
  onViewDetails,
}: InventoryTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {diamond.stockNumber || diamond.id}
      </TableCell>
      <TableCell>{diamond.shape}</TableCell>
      <TableCell>{diamond.carat}</TableCell>
      <TableCell>{diamond.color}</TableCell>
      <TableCell>{diamond.clarity}</TableCell>
      <TableCell>{diamond.cut || '-'}</TableCell>
      <TableCell>{diamond.polish || '-'}</TableCell>
      <TableCell>{diamond.symmetry || '-'}</TableCell>
      <TableCell>{diamond.fluorescence || '-'}</TableCell>
      <TableCell>
        {diamond.price ? `$${diamond.price.toLocaleString()}` : '-'}
      </TableCell>
      <TableCell>
        <Badge variant={diamond.store_visible ? "default" : "secondary"}>
          {diamond.store_visible ? "Visible" : "Hidden"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(diamond)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleVisibility(diamond)}
          >
            {diamond.store_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(diamond)}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(diamond)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
