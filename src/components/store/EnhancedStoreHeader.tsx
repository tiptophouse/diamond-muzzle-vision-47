import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { ShareQuotaIndicator } from "./ShareQuotaIndicator";

interface SortOption {
  value: string;
  label: string;
}

interface EnhancedStoreHeaderProps {
  totalDiamonds: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  onOpenFilters: () => void;
}

const sortOptions: SortOption[] = [
  { value: "most-popular", label: "Most popular" },
  { value: "price-low-high", label: "Price (low to high)" },
  { value: "price-high-low", label: "Price (high to low)" },
  { value: "carat-low-high", label: "Carat (low to high)" },
  { value: "carat-high-low", label: "Carat (high to low)" },
  { value: "newest", label: "Newest first" },
];

export function EnhancedStoreHeader({ 
  totalDiamonds, 
  sortBy, 
  onSortChange, 
  onOpenFilters 
}: EnhancedStoreHeaderProps) {
  return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Diamond collection</h1>
            <p className="text-sm text-slate-600 mt-1">
              {totalDiamonds} diamonds found
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFilters}
              className="p-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="p-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Share Quota Indicator */}
        <ShareQuotaIndicator />

        {/* Sort Dropdown */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Sort by
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-auto min-w-[160px] bg-white border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}