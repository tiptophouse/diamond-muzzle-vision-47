
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
  
  const { diamonds, loading, error, handleRefresh } = useInventoryData();
  const { deleteDiamond, isLoading: isDeleting } = useInventoryCrud();
  const [localDiamonds, setLocalDiamonds] = useState<Diamond[]>([]);

  useEffect(() => {
    if (diamonds && Array.isArray(diamonds)) {
      setLocalDiamonds(diamonds);
    }
  }, [diamonds]);

  const handleDelete = async (diamondId: string) => {
    try {
      const diamondData = localDiamonds.find(d => d.id === diamondId);
      await deleteDiamond(diamondId, diamondData);
      
      // Remove from local state immediately
      setLocalDiamonds(prev => prev.filter(d => d.id !== diamondId));
      
      // Refresh data from server
      await handleRefresh();
    } catch (error) {
      console.error('Failed to delete diamond:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setShapeFilter('all');
    setSortBy('updated_at');
    setSortOrder('desc');
  };

  // Filter diamonds based on search and shape
  const filteredDiamonds = localDiamonds.filter(diamond => {
    const stockNumber = diamond.stockNumber || diamond.stock_number || '';
    const shape = diamond.shape || '';
    const color = diamond.color || '';
    const clarity = diamond.clarity || '';
    
    const matchesSearch = searchQuery === '' || 
      stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shape.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clarity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesShape = shapeFilter === 'all' || diamond.shape === shapeFilter;
    
    return matchesSearch && matchesShape;
  });

  // Sort diamonds
  const sortedDiamonds = [...filteredDiamonds].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Diamond];
    let bValue: any = b[sortBy as keyof Diamond];
    
    if (sortBy === 'weight' || sortBy === 'carat' || sortBy === 'price_per_carat') {
      aValue = parseFloat(String(aValue)) || 0;
      bValue = parseFloat(String(bValue)) || 0;
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
          <p className="text-red-600">Error loading inventory: {error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
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
        totalCount={localDiamonds.length}
        onRefresh={handleRefresh}
      />
      
      <InventoryFilters
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedShape={shapeFilter}
        onShapeChange={setShapeFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        hasActiveFilters={hasSearchQuery}
        onClearFilters={clearFilters}
      />

      {sortedDiamonds.length === 0 ? (
        <InventoryTableEmpty />
      ) : (
        <InventoryTable 
          data={sortedDiamonds} 
          onDelete={handleDelete}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
