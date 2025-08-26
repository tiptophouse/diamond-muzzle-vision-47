
import React, { useState, useEffect } from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryTableEmpty } from '@/components/inventory/InventoryTableEmpty';
import { InventoryTableLoading } from '@/components/inventory/InventoryTableLoading';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventoryCrud } from '@/hooks/useInventoryCrud';
import { Diamond } from '@/types/diamond';

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [shapeFilter, setShapeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { data: inventory, isLoading, error, refetch } = useInventoryData();
  const { deleteById, isDeleting } = useInventoryCrud();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);

  useEffect(() => {
    if (inventory && Array.isArray(inventory)) {
      setDiamonds(inventory);
    }
  }, [inventory]);

  const handleDelete = async (diamondId: string) => {
    try {
      await deleteById(diamondId);
      await refetch();
    } catch (error) {
      console.error('Failed to delete diamond:', error);
    }
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setShapeFilter('all');
    setSortBy('updated_at');
    setSortOrder('desc');
  };

  // Filter diamonds based on search and shape
  const filteredDiamonds = diamonds.filter(diamond => {
    const matchesSearch = searchQuery === '' || 
      diamond.stock_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diamond.shape?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diamond.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diamond.clarity?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesShape = shapeFilter === 'all' || diamond.shape === shapeFilter;
    
    return matchesSearch && matchesShape;
  });

  // Sort diamonds
  const sortedDiamonds = [...filteredDiamonds].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Diamond];
    let bValue: any = b[sortBy as keyof Diamond];
    
    if (sortBy === 'weight' || sortBy === 'price_per_carat') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const hasSearchQuery = searchQuery.length > 0 || shapeFilter !== 'all';

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <InventoryHeader 
          totalCount={0}
          onRefresh={handleRefresh}
        />
        <div className="text-center py-8">
          <p className="text-red-600">Error loading inventory: {error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <InventoryHeader 
          totalCount={0}
          onRefresh={handleRefresh}
        />
        <InventoryTableLoading />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <InventoryHeader 
        totalCount={diamonds.length}
        onRefresh={handleRefresh}
      />
      
      <InventoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        shapeFilter={shapeFilter}
        onShapeFilterChange={setShapeFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        hasSearchQuery={hasSearchQuery}
        onClearFilters={clearFilters}
      />

      {sortedDiamonds.length === 0 ? (
        <InventoryTableEmpty />
      ) : (
        <InventoryTable 
          data={sortedDiamonds} 
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
