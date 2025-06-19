
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryTableRow } from './InventoryTableRow';
import { InventoryTableLoading } from './InventoryTableLoading';
import { InventoryTableEmpty } from './InventoryTableEmpty';

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

interface InventoryTableProps {
  inventory: InventoryItem[];
  loading?: boolean;
  onEdit?: (item: InventoryItem) => void;
  onToggleVisibility?: (stockNumber: string, visible: boolean) => void;
  onRefresh?: () => void;
}

export function InventoryTable({ 
  inventory, 
  loading = false, 
  onEdit, 
  onToggleVisibility,
  onRefresh 
}: InventoryTableProps) {
  if (loading) {
    return <InventoryTableLoading />;
  }

  if (!inventory || inventory.length === 0) {
    return <InventoryTableEmpty />;
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stock #</TableHead>
            <TableHead>Shape</TableHead>
            <TableHead>Carat</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Clarity</TableHead>
            <TableHead>Cut</TableHead>
            <TableHead>Lab</TableHead>
            <TableHead>Cert #</TableHead>
            <TableHead>Price/Ct</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((item) => (
            <InventoryTableRow
              key={item.id}
              item={item}
              onEdit={onEdit}
              onToggleVisibility={onToggleVisibility}
              onRefresh={onRefresh}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
