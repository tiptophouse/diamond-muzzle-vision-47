
import React, { useState } from 'react';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { DiamondFormModal } from '@/components/inventory/DiamondFormModal';
import { DeleteConfirmationModal } from '@/components/inventory/DeleteConfirmationModal';
import { BulkActionsToolbar } from '@/components/inventory/BulkActionsToolbar';
import { useDiamondOperations } from '@/hooks/inventory/useDiamondOperations';
import { useInventoryData } from '@/hooks/useInventoryData';
import { Diamond } from '@/types/diamond';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function InventoryPage() {
  const { allDiamonds: diamonds, isLoading, refetch } = useInventoryData();
  const { updateDiamond, deleteDiamond, isUpdating, isDeleting } = useDiamondOperations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [shapeFilter, setShapeFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [clarityFilter, setClarityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'stockNumber' | 'shape' | 'carat' | 'price' | 'status'>('stockNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedDiamonds, setSelectedDiamonds] = useState<string[]>([]);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);

  // Filter diamonds based on search and filters
  const filteredDiamonds = diamonds.filter(diamond => {
    const matchesSearch = !searchTerm || 
      diamond.stockNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diamond.shape.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diamond.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diamond.clarity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesShape = shapeFilter === 'all' || diamond.shape.toLowerCase() === shapeFilter.toLowerCase();
    const matchesColor = colorFilter === 'all' || diamond.color === colorFilter;
    const matchesClarity = clarityFilter === 'all' || diamond.clarity === clarityFilter;
    const matchesStatus = statusFilter === 'all' || (diamond.status || 'Available') === statusFilter;
    
    return matchesSearch && matchesShape && matchesColor && matchesClarity && matchesStatus;
  });

  const handleEdit = async (diamond: Diamond) => {
    setSelectedDiamond(diamond);
    setIsFormModalOpen(true);
  };

  const handleDelete = (diamond: Diamond) => {
    setSelectedDiamond(diamond);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedDiamond) {
      await deleteDiamond(selectedDiamond.id);
      setIsDeleteModalOpen(false);
      setSelectedDiamond(null);
      refetch();
    }
  };

  const handleSave = async (data: any) => {
    if (selectedDiamond) {
      await updateDiamond(selectedDiamond.id, data);
      setIsFormModalOpen(false);
      setSelectedDiamond(null);
      refetch();
    }
  };

  const handleBulkDelete = async () => {
    for (const diamondId of selectedDiamonds) {
      await deleteDiamond(diamondId);
    }
    setSelectedDiamonds([]);
    refetch();
  };

  const handleBulkStatusUpdate = () => {
    // Implementation for bulk status update
    console.log('Bulk status update for:', selectedDiamonds);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value as typeof sortBy);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as typeof sortOrder);
  };

  return (
    <TelegramLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <InventoryHeader 
            totalCount={diamonds.length} 
            onRefresh={() => refetch()}
          />
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Diamond
          </Button>
        </div>

        <InventoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          shapeFilter={shapeFilter}
          onShapeChange={setShapeFilter}
          colorFilter={colorFilter}
          onColorChange={setColorFilter}
          clarityFilter={clarityFilter}
          onClarityChange={setClarityFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={handleSortByChange}
          sortOrder={sortOrder}
          onSortOrderChange={handleSortOrderChange}
          diamonds={diamonds}
        />

        {selectedDiamonds.length > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedDiamonds.length}
            onClearSelection={() => setSelectedDiamonds([])}
            onBulkDelete={handleBulkDelete}
            onBulkStatusUpdate={handleBulkStatusUpdate}
          />
        )}

        <InventoryTable
          diamonds={filteredDiamonds}
          isLoading={isLoading}
          selectedDiamonds={selectedDiamonds}
          onSelectionChange={setSelectedDiamonds}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <DiamondFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSave}
          initialData={selectedDiamond}
          title={selectedDiamond ? 'Edit Diamond' : 'Add Diamond'}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          diamondName={selectedDiamond?.stockNumber || 'Unknown'}
        />
      </div>
    </TelegramLayout>
  );
}
