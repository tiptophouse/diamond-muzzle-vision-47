import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { CaratRangeFilter } from "./filters/CaratRangeFilter";
import { ClarityFilter } from "./filters/ClarityFilter";
import { ColorFilter } from "./filters/ColorFilter";
import { ShapeFilter } from "./filters/ShapeFilter";

interface StoreFiltersProps {
  filters: any;
  onUpdateFilter: (filterName: string, value: any) => void;
  onClearFilters: () => void;
  diamonds: any[];
}

export function StoreFilters({ filters, onUpdateFilter, onClearFilters, diamonds }: StoreFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);

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

  const activeFiltersCount =
    (filters.priceRange?.min ? 1 : 0) +
    (filters.priceRange?.max ? 1 : 0) +
    (filters.caratRange?.min ? 1 : 0) +
    (filters.caratRange?.max ? 1 : 0) +
    (filters.shapes?.length || 0) +
    (filters.clarities?.length || 0) +
    (filters.colors?.length || 0);

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
            onPriceRangeChange={handlePriceRangeChange}
            diamonds={diamonds}
          />
          <CaratRangeFilter
            caratRange={filters.caratRange}
            onCaratRangeChange={handleCaratRangeChange}
            diamonds={diamonds}
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
        </div>
      )}
    </div>
  );
}
