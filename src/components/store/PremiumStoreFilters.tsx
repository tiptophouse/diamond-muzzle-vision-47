
import { Diamond as DiamondType } from "@/components/inventory/InventoryTable";
import { FilterHeader } from "./filters/FilterHeader";
import { ShapeFilter } from "./filters/ShapeFilter";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { CaratRangeFilter } from "./filters/CaratRangeFilter";
import { ColorFilter } from "./filters/ColorFilter";
import { ClarityFilter } from "./filters/ClarityFilter";
import { CutFilter } from "./filters/CutFilter";
import { FluorescenceFilter } from "./filters/FluorescenceFilter";

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

  return (
    <div className="p-6 lg:p-8">
      <FilterHeader 
        activeFiltersCount={activeFiltersCount}
        onClearFilters={onClearFilters}
      />

      <ShapeFilter
        selectedShapes={filters.shapes}
        onShapeToggle={(shape) => toggleFilter('shapes', shape)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-8">
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

        <CutFilter
          selectedCuts={filters.cuts}
          onCutToggle={(cut) => toggleFilter('cuts', cut)}
        />

        <FluorescenceFilter
          selectedFluorescence={filters.fluorescence}
          onFluorescenceToggle={(fluorescence) => toggleFilter('fluorescence', fluorescence)}
        />
      </div>
    </div>
  );
}
