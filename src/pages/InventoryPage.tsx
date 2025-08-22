
import React, { useState } from 'react';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventorySearch } from '@/components/inventory/InventorySearch';
import { InventoryPagination } from '@/components/inventory/InventoryPagination';
import { InventoryMobileCard } from '@/components/inventory/InventoryMobileCard';
import { DiamondForm } from '@/components/inventory/DiamondForm';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventorySearch } from '@/hooks/useInventorySearch';
import { useDeleteDiamond } from '@/hooks/inventory/useDeleteDiamond';
import { useUpdateDiamond } from '@/hooks/inventory/useUpdateDiamond';
import { useMobile } from '@/hooks/use-mobile';
import { Diamond } from '@/types/diamond';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('carat');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    data: inventoryData,
    isLoading,
    error,
    refetch
  } = useInventoryData(page, 20);

  const { filteredDiamonds } = useInventorySearch(
    inventoryData?.diamonds || [],
    searchTerm
  );

  const deleteStone = useDeleteDiamond();
  const updateStone = useUpdateDiamond();

  const handleEdit = (diamond: Diamond) => {
    setEditingDiamond(diamond);
    setIsFormOpen(true);
  };

  const handleDelete = async (diamond: Diamond) => {
    if (confirm(`Are you sure you want to delete this ${diamond.shape} ${diamond.carat}ct diamond?`)) {
      try {
        await deleteStone.mutateAsync(diamond);
        toast({
          title: "Diamond deleted successfully",
          description: `${diamond.shape} ${diamond.carat}ct has been removed`,
        });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleToggleVisibility = async (diamond: Diamond) => {
    try {
      await updateStone.mutateAsync({
        ...diamond,
        store_visible: !diamond.store_visible
      });
      
      toast({
        title: diamond.store_visible ? "Diamond hidden from store" : "Diamond visible in store",
        description: `${diamond.shape} ${diamond.carat}ct visibility updated`,
      });
    } catch (error) {
      console.error('Visibility toggle error:', error);
    }
  };

  const handleViewDetails = (diamond: Diamond) => {
    // Navigate to diamond details
    const diamondId = diamond.diamondId || diamond.id;
    window.open(`/diamond/${diamondId}`, '_blank');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleFormSubmit = async (diamondData: any) => {
    try {
      if (editingDiamond) {
        await updateStone.mutateAsync({
          ...editingDiamond,
          ...diamondData
        });
        toast({
          title: "Diamond updated successfully",
          description: `${diamondData.shape} ${diamondData.carat}ct has been updated`,
        });
      } else {
        // Handle add new diamond
        toast({
          title: "Diamond added successfully",
          description: `${diamondData.shape} ${diamondData.carat}ct has been added`,
        });
      }
      
      setIsFormOpen(false);
      setEditingDiamond(null);
      refetch();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingDiamond(null);
  };

  if (error) {
    return (
      <TelegramLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading inventory: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="space-y-6">
        <InventoryHeader onAddNew={() => setIsFormOpen(true)} />
        
        <div className="space-y-4">
          <InventorySearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          <InventoryFilters />
        </div>

        {isMobile ? (
          <div className="space-y-4">
            {filteredDiamonds.map((diamond) => (
              <InventoryMobileCard
                key={diamond.id}
                diamond={diamond}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <InventoryTable
            diamonds={filteredDiamonds}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
            onViewDetails={handleViewDetails}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}

        <InventoryPagination
          currentPage={page}
          totalPages={inventoryData?.totalPages || 1}
          onPageChange={setPage}
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDiamond ? 'Edit Diamond' : 'Add New Diamond'}
              </DialogTitle>
            </DialogHeader>
            <DiamondForm
              initialData={editingDiamond}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={updateStone.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TelegramLayout>
  );
}
