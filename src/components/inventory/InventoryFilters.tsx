
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';

interface InventoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedShape: string;
  onShapeChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const shapes = [
  'all',
  'ROUND',
  'PRINCESS',
  'CUSHION',
  'EMERALD',
  'OVAL',
  'RADIANT',
  'ASSCHER',
  'MARQUISE',
  'HEART',
  'PEAR'
];

export function InventoryFilters({
  searchQuery,
  onSearchChange,
  selectedShape,
  onShapeChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  hasActiveFilters,
  onClearFilters
}: InventoryFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search diamonds..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Shape Filter */}
        <Select value={selectedShape} onValueChange={onShapeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select shape" />
          </SelectTrigger>
          <SelectContent>
            {shapes.map((shape) => (
              <SelectItem key={shape} value={shape}>
                {shape === 'all' ? 'All Shapes' : shape}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Updated Date</SelectItem>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="carat">Carat</SelectItem>
            <SelectItem value="price_per_carat">Price</SelectItem>
            <SelectItem value="color">Color</SelectItem>
            <SelectItem value="clarity">Clarity</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Button
          variant="outline"
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </div>
    </div>
  );
}
