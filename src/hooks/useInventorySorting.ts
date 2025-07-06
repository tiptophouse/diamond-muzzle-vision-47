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

      // Convert to strings for comparison if not numbers
      if (typeof aVal !== 'number' && typeof bVal !== 'number') {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;

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