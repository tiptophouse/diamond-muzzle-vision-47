
import { useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventorySearch } from '@/components/inventory/InventorySearch';
import { InventoryPagination } from '@/components/inventory/InventoryPagination';
import { DiamondForm } from '@/components/inventory/DiamondForm';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventorySearch } from '@/hooks/useInventorySearch';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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

export default function InventoryPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Use inventory data hook with refresh capability
  const { 
    inventory, 
    loading, 
    error, 
    refetch: refreshInventory 
  } = useInventoryData();

  // Search and filter functionality
  const {
    searchQuery,
    setSearchQuery,
    filteredInventory
  } = useInventorySearch(inventory);

  // Pagination
  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInventory.slice(startIndex, endIndex);

  // Refresh inventory after any changes
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing inventory...');
    refreshInventory();
  }, [refreshInventory]);

  const handleAddDiamond = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditDiamond = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    // Refresh inventory after form closes (in case of add/edit)
    handleRefresh();
  };

  const handleToggleVisibility = async (stockNumber: string, visible: boolean) => {
    console.log('👁️ Toggling visibility for:', stockNumber, 'to:', visible);
    // TODO: Implement store visibility toggle
    // This would call your backend API to update the store_visible field
    handleRefresh();
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <InventoryHeader
          totalCount={totalItems}
          onRefresh={handleRefresh}
          loading={loading}
          onAddDiamond={handleAddDiamond}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <InventoryFilters />
          </div>
          
          <div className="lg:col-span-3 space-y-4">
            <InventorySearch 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            
            <InventoryTable
              inventory={currentItems}
              loading={loading}
              onEdit={handleEditDiamond}
              onToggleVisibility={handleToggleVisibility}
              onRefresh={handleRefresh}
            />
            
            {totalPages > 1 && (
              <InventoryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DiamondForm
              initialData={editingItem}
              onClose={handleFormClose}
              onSuccess={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
