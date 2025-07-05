
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { CaratRangeFilter } from "./filters/CaratRangeFilter";
import { ClarityFilter } from "./filters/ClarityFilter";
import { ColorFilter } from "./filters/ColorFilter";
import { ShapeFilter } from "./filters/ShapeFilter";
import { CutFilter } from "./filters/CutFilter";
import { FluorescenceFilter } from "./filters/FluorescenceFilter";

interface StoreFiltersProps {
  filters: any;
  onUpdateFilter: (filterName: string, value: any) => void;
  onClearFilters: () => void;
  diamonds: any[];
}

export function StoreFilters({ filters, onUpdateFilter, onClearFilters, diamonds }: StoreFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Calculate min/max values from diamonds data
  const getMinMaxValues = () => {
    if (!diamonds || diamonds.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 100000,
        minCarat: 0,
        maxCarat: 10
      };
    }

    const prices = diamonds.map(d => d.price).filter(p => p != null);
    const carats = diamonds.map(d => d.carat).filter(c => c != null);

    return {
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 100000,
      minCarat: carats.length > 0 ? Math.min(...carats) : 0,
      maxCarat: carats.length > 0 ? Math.max(...carats) : 10
    };
  };

  const { minPrice, maxPrice, minCarat, maxCarat } = getMinMaxValues();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    onUpdateFilter('priceRange', { min: range[0], max: range[1] });
  };

  const handleCaratRangeChange = (range: [number, number]) => {
    onUpdateFilter('caratRange', { min: range[0], max: range[1] });
  };

  const handleShapeToggle = (shape: string) => {
    const selectedShapes = new Set(filters.shapes);
    if (selectedShapes.has(shape)) {
      selectedShapes.delete(shape);
    } else {
      selectedShapes.add(shape);
    }
    onUpdateFilter('shapes', Array.from(selectedShapes));
  };

  const handleClarityToggle = (clarity: string) => {
    const selectedClarities = new Set(filters.clarities);
    if (selectedClarities.has(clarity)) {
      selectedClarities.delete(clarity);
    } else {
      selectedClarities.add(clarity);
    }
    
    onUpdateFilter('clarities', Array.from(selectedClarities));
  };

  const handleColorToggle = (color: string) => {
    const selectedColors = new Set(filters.colors);
    if (selectedColors.has(color)) {
      selectedColors.delete(color);
    } else {
      selectedColors.add(color);
    }
    
    onUpdateFilter('colors', Array.from(selectedColors));
  };

  const handleCutToggle = (cut: string) => {
    const selectedCuts = new Set(filters.cuts || []);
    if (selectedCuts.has(cut)) {
      selectedCuts.delete(cut);
    } else {
      selectedCuts.add(cut);
    }
    
    onUpdateFilter('cuts', Array.from(selectedCuts));
  };

  const handleFluorescenceToggle = (fluorescence: string) => {
    const selectedFluorescence = new Set(filters.fluorescence || []);
    if (selectedFluorescence.has(fluorescence)) {
      selectedFluorescence.delete(fluorescence);
    } else {
      selectedFluorescence.add(fluorescence);
    }
    
    onUpdateFilter('fluorescence', Array.from(selectedFluorescence));
  };

  const activeFiltersCount =
    (filters.priceRange?.min ? 1 : 0) +
    (filters.priceRange?.max ? 1 : 0) +
    (filters.caratRange?.min ? 1 : 0) +
    (filters.caratRange?.max ? 1 : 0) +
    (filters.shapes?.length || 0) +
    (filters.clarities?.length || 0) +
    (filters.colors?.length || 0) +
    (filters.cuts?.length || 0) +
    (filters.fluorescence?.length || 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Refine Your Search</h2>
            <p className="text-sm text-slate-600">Find your perfect diamond</p>
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {activeFiltersCount} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        className="w-full justify-between text-slate-700 hover:bg-slate-50 rounded-xl"
        onClick={handleToggle}
      >
        <span>Filters</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="space-y-6 pt-4">
          <PriceRangeFilter
            priceRange={filters.priceRange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceRangeChange={handlePriceRangeChange}
          />
          <CaratRangeFilter
            caratRange={filters.caratRange}
            minCarat={minCarat}
            maxCarat={maxCarat}
            onCaratRangeChange={handleCaratRangeChange}
          />
          <ShapeFilter
            selectedShapes={filters.shapes || []}
            onShapeToggle={handleShapeToggle}
          />
          <ClarityFilter
            selectedClarities={filters.clarities || []}
            onClarityToggle={handleClarityToggle}
          />
          <ColorFilter
            selectedColors={filters.colors || []}
            onColorToggle={handleColorToggle}
          />
          <CutFilter
            selectedCuts={filters.cuts || []}
            onCutToggle={handleCutToggle}
          />
          <FluorescenceFilter
            selectedFluorescence={filters.fluorescence || []}
            onFluorescenceToggle={handleFluorescenceToggle}
          />
        </div>
      )}
    </div>
  );
}
