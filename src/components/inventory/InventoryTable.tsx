
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Diamond } from '@/types/diamond';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface InventoryTableProps {
  diamonds: Diamond[];
  isLoading?: boolean;
  selectedDiamonds: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamond: Diamond) => void;
  onToggleVisibility?: (diamond: Diamond) => void;
  onViewDetails?: (diamond: Diamond) => void;
  sortBy?: string;
  sortOrder?: string;
  onSort?: (field: string) => void;
}

export function InventoryTable({
  diamonds,
  isLoading = false,
  selectedDiamonds,
  onSelectionChange,
  onEdit,
  onDelete,
  onToggleVisibility,
  onViewDetails,
  sortBy,
  sortOrder,
  onSort
}: InventoryTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(diamonds.map(d => d.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectDiamond = (diamondId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedDiamonds, diamondId]);
    } else {
      onSelectionChange(selectedDiamonds.filter(id => id !== diamondId));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedDiamonds.length === diamonds.length && diamonds.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Stock Number</TableHead>
            <TableHead>Shape</TableHead>
            <TableHead>Carat</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Clarity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diamonds.map((diamond) => (
            <TableRow key={diamond.id}>
              <TableCell>
                <Checkbox
                  checked={selectedDiamonds.includes(diamond.id)}
                  onCheckedChange={(checked) => handleSelectDiamond(diamond.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="font-medium">{diamond.stockNumber}</TableCell>
              <TableCell>{diamond.shape}</TableCell>
              <TableCell>{diamond.carat}</TableCell>
              <TableCell>{diamond.color}</TableCell>
              <TableCell>{diamond.clarity}</TableCell>
              <TableCell>{diamond.price ? `$${diamond.price.toLocaleString()}` : '-'}</TableCell>
              <TableCell>{diamond.status || 'Available'}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(diamond)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(diamond)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {onToggleVisibility && (
                    <Button size="sm" variant="ghost" onClick={() => onToggleVisibility(diamond)}>
                      {diamond.store_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  )}
                  {onViewDetails && (
                    <Button size="sm" variant="ghost" onClick={() => onViewDetails(diamond)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
