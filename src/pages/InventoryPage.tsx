
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
import { Diamond } from '@/types/diamond';

export default function InventoryPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Diamond | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Use inventory data hook with refresh capability
  const { 
    diamonds, 
    loading, 
    error, 
    handleRefresh 
  } = useInventoryData();

  // Search and filter functionality
  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds
  } = useInventorySearch(diamonds);

  // Pagination
  const totalItems = filteredDiamonds.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredDiamonds.slice(startIndex, endIndex);

  const handleAddDiamond = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditDiamond = (item: any) => {
    // Convert InventoryItem to Diamond format
    const diamondItem: Diamond = {
      id: item.id,
      stockNumber: item.stock_number || item.stockNumber,
      shape: item.shape,
      carat: item.weight || item.carat,
      color: item.color,
      clarity: item.clarity,
      cut: item.cut || 'Excellent',
      price: item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price || 0,
      status: item.status || 'Available',
      imageUrl: item.picture || item.imageUrl,
      store_visible: item.store_visible,
      certificateNumber: item.certificate_number,
      lab: item.lab
    };
    setEditingItem(diamondItem);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useInventorySearch hook automatically
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
            <InventoryFilters onFilterChange={() => {}} />
          </div>
          
          <div className="lg:col-span-3 space-y-4">
            <InventorySearch 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSubmit={handleSearch}
              allDiamonds={diamonds}
            />
            
            <InventoryTable
              inventory={currentItems.map(diamond => ({
                id: diamond.id,
                stock_number: diamond.stockNumber,
                shape: diamond.shape,
                weight: diamond.carat,
                color: diamond.color,
                clarity: diamond.clarity,
                cut: diamond.cut,
                lab: diamond.lab,
                certificate_number: diamond.certificateNumber ? Number(diamond.certificateNumber) : undefined,
                price_per_carat: diamond.price / diamond.carat,
                store_visible: diamond.store_visible,
                status: diamond.status
              }))}
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
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DiamondForm
              diamond={editingItem}
              onSubmit={() => {}}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
