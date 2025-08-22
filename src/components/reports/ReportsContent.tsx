
import React from 'react';
import { Diamond } from '@/types/diamond';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportsContentProps {
  diamonds: Diamond[];
  isLoading: boolean;
}

export function ReportsContent({ diamonds, isLoading }: ReportsContentProps) {
  const handleEdit = (diamond: Diamond) => {
    // Handle edit functionality
    console.log('Edit diamond:', diamond);
  };

  const handleDelete = (diamond: Diamond) => {
    // Handle delete functionality
    console.log('Delete diamond:', diamond);
  };

  const handleToggleVisibility = (diamond: Diamond) => {
    // Handle visibility toggle
    console.log('Toggle visibility:', diamond);
  };

  const handleViewDetails = (diamond: Diamond) => {
    // Handle view details
    console.log('View details:', diamond);
  };

  const handleSort = (field: string) => {
    // Handle sorting
    console.log('Sort by:', field);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Report</CardTitle>
        <CardDescription>
          Overview of your diamond inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InventoryTable
          diamonds={diamonds}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          onViewDetails={handleViewDetails}
          sortBy="carat"
          sortOrder="desc"
          onSort={handleSort}
        />
      </CardContent>
    </Card>
  );
}
