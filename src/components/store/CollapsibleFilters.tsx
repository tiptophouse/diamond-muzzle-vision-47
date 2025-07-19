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
    <div className="bg-background rounded-xl border shadow-sm">
      {/* Filter Toggle Button - Telegram style */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full flex items-center justify-between text-foreground hover:bg-muted/50 min-h-[48px] touch-target rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Filter className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-base">💎 Filter Diamonds</span>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {activeFiltersCount} active
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-muted-foreground">
            {isFiltersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </Button>
      </div>

      {/* Collapsible Filter Content */}
      {isFiltersOpen && (
        <div className="border-t">
          <PremiumStoreFilters
            filters={filters}
            onUpdateFilter={onUpdateFilter}
            onClearFilters={onClearFilters}
            diamonds={diamonds}
          />
        </div>
      )}
    </div>
  );
}