
import { useState } from "react";
import { Diamond as DiamondType } from "@/components/inventory/InventoryTable";
import { FilterHeader } from "./filters/FilterHeader";
import { ShapeFilter } from "./filters/ShapeFilter";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { CaratRangeFilter } from "./filters/CaratRangeFilter";
import { ColorFilter } from "./filters/ColorFilter";
import { ClarityFilter } from "./filters/ClarityFilter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

interface PremiumStoreFiltersProps {
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

export function PremiumStoreFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  diamonds
}: PremiumStoreFiltersProps) {
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const getMinMaxValues = () => {
    if (!diamonds || diamonds.length === 0) {
      return { minCarat: 0, maxCarat: 10, minPrice: 0, maxPrice: 100000 };
    }
    
    const carats = diamonds.map(d => d.carat);
    const prices = diamonds.map(d => d.price);
    
    return {
      minCarat: Math.min(...carats),
      maxCarat: Math.max(...carats),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    };
  };

  const { minCarat, maxCarat, minPrice, maxPrice } = getMinMaxValues();
  
  const activeFiltersCount = 
    filters.shapes.length + 
    filters.colors.length + 
    filters.clarities.length + 
    filters.cuts.length + 
    filters.fluorescence.length + 
    (filters.caratRange[0] > minCarat || filters.caratRange[1] < maxCarat ? 1 : 0) +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0);

  const toggleFilter = (type: string, value: string) => {
    const currentValues = filters[type as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdateFilter(type, newValues);
  };

  const cutGrades = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
  const fluorescenceGrades = ["None", "Faint", "Medium", "Strong", "Very Strong"];

  return (
    <div className="p-6 lg:p-8">
      {/* Quick Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {isFiltersVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Cut Dropdown */}
        <Select 
          value={filters.cuts[0] || ""} 
          onValueChange={(value) => onUpdateFilter('cuts', value ? [value] : [])}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Cut Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Cuts</SelectItem>
            {cutGrades.map((cut) => (
              <SelectItem key={cut} value={cut}>
                {cut}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Fluorescence Dropdown */}
        <Select 
          value={filters.fluorescence[0] || ""} 
          onValueChange={(value) => onUpdateFilter('fluorescence', value ? [value] : [])}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Fluorescence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Fluorescence</SelectItem>
            {fluorescenceGrades.map((fluorescence) => (
              <SelectItem key={fluorescence} value={fluorescence}>
                {fluorescence}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={onClearFilters} className="text-sm">
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Collapsible Advanced Filters */}
      {isFiltersVisible && (
        <div className="space-y-6">
          <FilterHeader 
            activeFiltersCount={activeFiltersCount}
            onClearFilters={onClearFilters}
          />

          <ShapeFilter
            selectedShapes={filters.shapes}
            onShapeToggle={(shape) => toggleFilter('shapes', shape)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            <PriceRangeFilter
              priceRange={filters.priceRange}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceRangeChange={(range) => onUpdateFilter('priceRange', range)}
            />

            <CaratRangeFilter
              caratRange={filters.caratRange}
              minCarat={minCarat}
              maxCarat={maxCarat}
              onCaratRangeChange={(range) => onUpdateFilter('caratRange', range)}
            />

            <ColorFilter
              selectedColors={filters.colors}
              onColorToggle={(color) => toggleFilter('colors', color)}
            />

            <ClarityFilter
              selectedClarities={filters.clarities}
              onClarityToggle={(clarity) => toggleFilter('clarities', clarity)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
