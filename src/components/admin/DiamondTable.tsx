
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Edit, Trash2, ImageIcon } from 'lucide-react';

interface DiamondTableProps {
  diamonds: Diamond[];
  loading: boolean;
  selectedDiamonds: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit: (diamond: Diamond) => void;
  onDelete: (stockNumber: string) => void;
}

export function DiamondTable({ 
  diamonds, 
  loading, 
  selectedDiamonds, 
  onSelectionChange, 
  onEdit, 
  onDelete 
}: DiamondTableProps) {
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

  const isAllSelected = diamonds.length > 0 && selectedDiamonds.length === diamonds.length;
  const isPartiallySelected = selectedDiamonds.length > 0 && selectedDiamonds.length < diamonds.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No diamonds found. Add some diamonds to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all diamonds"
                {...(isPartiallySelected && { 'data-state': 'indeterminate' })}
              />
            </TableHead>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Stock #</TableHead>
            <TableHead>Shape</TableHead>
            <TableHead>Carat</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Clarity</TableHead>
            <TableHead>Cut</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diamonds.map((diamond) => (
            <TableRow key={diamond.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <TableCell>
                <Checkbox
                  checked={selectedDiamonds.includes(diamond.id)}
                  onCheckedChange={(checked) => handleSelectDiamond(diamond.id, checked as boolean)}
                  aria-label={`Select diamond ${diamond.stockNumber}`}
                />
              </TableCell>
              <TableCell>
                {diamond.imageUrl ? (
                  <img 
                    src={diamond.imageUrl} 
                    alt={`Diamond ${diamond.stockNumber}`}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded border flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm font-bold text-blue-600">
                #{diamond.stockNumber}
              </TableCell>
              <TableCell className="font-medium">{diamond.shape}</TableCell>
              <TableCell className="text-right font-medium">
                {diamond.carat.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{diamond.color}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{diamond.clarity}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{diamond.cut}</Badge>
              </TableCell>
              <TableCell className="text-right font-bold">
                ${diamond.price.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    diamond.status === "Available" 
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                      : diamond.status === "Reserved" 
                      ? "bg-blue-100 text-blue-800 border-blue-300" 
                      : "bg-slate-100 text-slate-800 border-slate-300"
                  }
                  variant="outline"
                >
                  {diamond.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(diamond)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(diamond.stockNumber)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
