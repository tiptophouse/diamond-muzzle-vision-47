import { Diamond as DiamondType } from "@/components/inventory/InventoryTable";
import { FilterSectionHeader } from "./filters/FilterSectionHeader";
import { ShapeFilter } from "./filters/ShapeFilter";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { CaratRangeFilter } from "./filters/CaratRangeFilter";
import { ColorFilter } from "./filters/ColorFilter";
import { ClarityFilter } from "./filters/ClarityFilter";
import { CutFilter } from "./filters/CutFilter";
import { FluorescenceFilter } from "./filters/FluorescenceFilter";
import { PolishFilter } from "./filters/PolishFilter";
import { SymmetryFilter } from "./filters/SymmetryFilter";
import { DepthFilter } from "./filters/DepthFilter";
import { TableFilter } from "./filters/TableFilter";
import { Button } from "@/components/ui/button";

interface FigmaStoreFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
    cuts: string[];
    fluorescence: string[];
    polish: string[];
    symmetry: string[];
    caratRange: [number, number];
    priceRange: [number, number];
    depthRange: [number, number];
    tableRange: [number, number];
  };
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  diamonds: DiamondType[];
}

export function FigmaStoreFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters,
  onApplyFilters,
  diamonds
}: FigmaStoreFiltersProps) {
  const getMinMaxValues = () => {
    if (!diamonds || diamonds.length === 0) {
      return { 
        minCarat: 0, maxCarat: 10, 
        minPrice: 0, maxPrice: 100000,
        minDepth: 0, maxDepth: 100,
        minTable: 0, maxTable: 100
      };
    }
    
    const carats = diamonds.map(d => d.carat);
    const prices = diamonds.map(d => d.price);
    // Note: depth_percentage and table_percentage may not exist in current Diamond type
    // Using default ranges for now
    const depths = [50, 60, 70, 80]; // Default depth range
    const tables = [45, 55, 65, 75]; // Default table range
    
    return {
      minCarat: Math.min(...carats),
      maxCarat: Math.max(...carats),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      minDepth: depths.length > 0 ? Math.min(...depths) : 0,
      maxDepth: depths.length > 0 ? Math.max(...depths) : 100,
      minTable: tables.length > 0 ? Math.min(...tables) : 0,
      maxTable: tables.length > 0 ? Math.max(...tables) : 100
    };
  };

  const { minCarat, maxCarat, minPrice, maxPrice, minDepth, maxDepth, minTable, maxTable } = getMinMaxValues();

  const toggleFilter = (type: string, value: string) => {
    const currentValues = filters[type as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdateFilter(type, newValues);
  };

  const activeFiltersCount = 
    filters.shapes.length + 
    filters.colors.length + 
    filters.clarities.length + 
    filters.cuts.length + 
    filters.fluorescence.length +
    filters.polish.length +
    filters.symmetry.length +
    (filters.caratRange[0] > minCarat || filters.caratRange[1] < maxCarat ? 1 : 0) +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0) +
    (filters.depthRange[0] > minDepth || filters.depthRange[1] < maxDepth ? 1 : 0) +
    (filters.tableRange[0] > minTable || filters.tableRange[1] < maxTable ? 1 : 0);

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-primary hover:text-primary-dark"
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Diamond Shape */}
        <div className="space-y-3">
          <FilterSectionHeader label="Diamond shape" />
          <ShapeFilter
            selectedShapes={filters.shapes}
            onShapeToggle={(shape) => toggleFilter('shapes', shape)}
          />
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <FilterSectionHeader label="Price range" />
          <PriceRangeFilter
            priceRange={filters.priceRange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceRangeChange={(range) => onUpdateFilter('priceRange', range)}
          />
        </div>

        {/* Carat Weight */}
        <div className="space-y-3">
          <FilterSectionHeader label="Carat weight" />
          <CaratRangeFilter
            caratRange={filters.caratRange}
            minCarat={minCarat}
            maxCarat={maxCarat}
            onCaratRangeChange={(range) => onUpdateFilter('caratRange', range)}
          />
        </div>

        {/* Color */}
        <div className="space-y-3">
          <FilterSectionHeader label="Color" />
          <ColorFilter
            selectedColors={filters.colors}
            onColorToggle={(color) => toggleFilter('colors', color)}
          />
        </div>

        {/* Clarity */}
        <div className="space-y-3">
          <FilterSectionHeader label="Clarity" />
          <ClarityFilter
            selectedClarities={filters.clarities}
            onClarityToggle={(clarity) => toggleFilter('clarities', clarity)}
          />
        </div>

        {/* Cut */}
        <div className="space-y-3">
          <FilterSectionHeader label="Cut" />
          <CutFilter
            selectedCuts={filters.cuts}
            onCutToggle={(cut) => toggleFilter('cuts', cut)}
          />
        </div>

        {/* Fluorescence */}
        <div className="space-y-3">
          <FilterSectionHeader label="Fluorescence" />
          <FluorescenceFilter
            selectedFluorescence={filters.fluorescence}
            onFluorescenceToggle={(fluorescence) => toggleFilter('fluorescence', fluorescence)}
          />
        </div>

        {/* Symmetry */}
        <div className="space-y-3">
          <FilterSectionHeader label="Symmetry" />
          <SymmetryFilter
            selectedSymmetry={filters.symmetry}
            onSymmetryToggle={(symmetry) => toggleFilter('symmetry', symmetry)}
          />
        </div>

        {/* Polish */}
        <div className="space-y-3">
          <FilterSectionHeader label="Polish" />
          <PolishFilter
            selectedPolish={filters.polish}
            onPolishToggle={(polish) => toggleFilter('polish', polish)}
          />
        </div>

        {/* Total Depth */}
        <div className="space-y-3">
          <FilterSectionHeader label="Total depth (%)" />
          <DepthFilter
            depthRange={filters.depthRange}
            minDepth={minDepth}
            maxDepth={maxDepth}
            onDepthRangeChange={(range) => onUpdateFilter('depthRange', range)}
          />
        </div>

        {/* Table */}
        <div className="space-y-3">
          <FilterSectionHeader label="Table (%)" />
          <TableFilter
            tableRange={filters.tableRange}
            minTable={minTable}
            maxTable={maxTable}
            onTableRangeChange={(range) => onUpdateFilter('tableRange', range)}
          />
        </div>

        {/* Apply Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={onApplyFilters} 
            className="w-full bg-primary hover:bg-primary-dark text-white h-12 font-semibold"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}