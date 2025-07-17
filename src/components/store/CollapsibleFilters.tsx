import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { PremiumStoreFilters } from "./PremiumStoreFilters";
import { Diamond as DiamondType } from "@/components/inventory/InventoryTable";

interface CollapsibleFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
    cuts: string[];
    fluorescence: string[];
    caratRange: [number, number];
    priceRange: [number, number];
  };
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  diamonds: DiamondType[];
}

export function CollapsibleFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  diamonds 
}: CollapsibleFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFiltersCount = 
    filters.shapes.length + 
    filters.colors.length + 
    filters.clarities.length + 
    filters.cuts.length + 
    filters.fluorescence.length + 
    (filters.caratRange[0] > 0 || filters.caratRange[1] < 10 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 ? 1 : 0);

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-900/5">
      {/* Filter Toggle Button */}
      <div className="p-4 border-b border-slate-200/50">
        <Button
          variant="ghost"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full flex items-center justify-between text-slate-800 hover:bg-slate-50/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <span className="font-semibold">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
          </div>
          {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Collapsible Filter Content */}
      {isFiltersOpen && (
        <PremiumStoreFilters
          filters={filters}
          onUpdateFilter={onUpdateFilter}
          onClearFilters={onClearFilters}
          diamonds={diamonds}
        />
      )}
    </div>
  );
}