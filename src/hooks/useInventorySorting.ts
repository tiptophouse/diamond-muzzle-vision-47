import { useState, useMemo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';

export function useInventorySorting(diamonds: Diamond[]) {
  const [sortField, setSortField] = useState<keyof Diamond>('stockNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedDiamonds = useMemo(() => {
    if (!diamonds.length) return diamonds;

    return [...diamonds].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle numeric fields (price, carat, etc.)
      const numericFields: (keyof Diamond)[] = ['price', 'carat'];
      
      if (numericFields.includes(sortField)) {
        // Ensure we're comparing numbers
        const aNum = typeof aVal === 'number' ? aVal : parseFloat(String(aVal)) || 0;
        const bNum = typeof bVal === 'number' ? bVal : parseFloat(String(bVal)) || 0;
        
        const comparison = aNum - bNum;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // For non-numeric fields, convert to strings
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      let comparison = 0;
      if (aStr < bStr) comparison = -1;
      else if (aStr > bStr) comparison = 1;

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [diamonds, sortField, sortDirection]);

  const handleSort = (field: keyof Diamond) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    sortedDiamonds,
    sortField,
    sortDirection,
    handleSort,
  };
}