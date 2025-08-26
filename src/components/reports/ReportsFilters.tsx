
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface ReportsFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
  filters?: Record<string, string>;
}

export function ReportsFilters({ onFilterChange, filters = {} }: ReportsFiltersProps) {
  const handleFilterUpdate = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Report Filters</h3>
        </div>
        {Object.keys(filters).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={filters.search || ''}
            onChange={(e) => handleFilterUpdate('search', e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filters.dateRange || ''} onValueChange={(value) => handleFilterUpdate('dateRange', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.type || ''} onValueChange={(value) => handleFilterUpdate('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales Reports</SelectItem>
            <SelectItem value="inventory">Inventory Reports</SelectItem>
            <SelectItem value="analytics">Analytics Reports</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
