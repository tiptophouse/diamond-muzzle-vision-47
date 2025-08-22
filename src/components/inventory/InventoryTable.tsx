
import React, { useState } from 'react';
import { Diamond } from '@/types/diamond';
import { InventoryTableHeader } from './InventoryTableHeader';
import { InventoryTableRow } from './InventoryTableRow';
import { InventoryTableEmpty } from './InventoryTableEmpty';
import { InventoryTableLoading } from './InventoryTableLoading';
import { Table, TableBody } from '@/components/ui/table';

interface InventoryTableProps {
  diamonds: Diamond[];
  isLoading: boolean;
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamond: Diamond) => void;
  onToggleVisibility: (diamond: Diamond) => void;
  onViewDetails: (diamond: Diamond) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function InventoryTable({
  diamonds,
  isLoading,
  onEdit,
  onDelete,
  onToggleVisibility,
  onViewDetails,
  sortBy,
  sortOrder,
  onSort,
}: InventoryTableProps) {
  if (isLoading) {
    return <InventoryTableLoading />;
  }

  if (!diamonds || diamonds.length === 0) {
    return <InventoryTableEmpty />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <InventoryTableHeader
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        />
        <TableBody>
          {diamonds.map((diamond) => (
            <InventoryTableRow
              key={diamond.id}
              diamond={diamond}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
              onViewDetails={onViewDetails}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Export for backward compatibility
export { InventoryTable as default };
