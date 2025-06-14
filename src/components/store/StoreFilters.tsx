
import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Diamond } from "@/components/inventory/InventoryTable";
import { ShapeSelector } from "./ShapeSelector";
import { ColorScroller } from "./ColorScroller";
import { ClarityScroller } from "./ClarityScroller";

interface StoreFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
    caratRange: [number, number];
    priceRange: [number, number];
  };
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  diamonds: Diamond[];
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function StoreFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  diamonds,
  isOpen = false,
  onClose,
  isMobile = false
}: StoreFiltersProps) {
  const [customPriceMin, setCustomPriceMin] = useState("");
  const [customPriceMax, setCustomPriceMax] = useState("");
  const [customCaratMin, setCustomCaratMin] = useState("");
  const [customCaratMax, setCustomCaratMax] = useState("");

  const getMinMaxValues = () => {
    if (diamonds.length === 0) return { minCarat: 0, maxCarat: 10, minPrice: 0, maxPrice: 100000 };
    
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
    (filters.caratRange[0] > minCarat || filters.caratRange[1] < maxCarat ? 1 : 0) +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0);

  const toggleFilter = (type: string, value: string) => {
    const currentValues = filters[type as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdateFilter(type, newValues);
  };

  const handlePriceUpdate = () => {
    const minVal = customPriceMin ? parseFloat(customPriceMin) : minPrice;
    const maxVal = customPriceMax ? parseFloat(customPriceMax) : maxPrice;
    onUpdateFilter('priceRange', [minVal, maxVal]);
  };

  const handleCaratUpdate = () => {
    const minVal = customCaratMin ? parseFloat(customCaratMin) : minCarat;
    const maxVal = customCaratMax ? parseFloat(customCaratMax) : maxCarat;
    onUpdateFilter('caratRange', [minVal, maxVal]);
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Shape Selector */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 text-lg">Shape</h4>
        <ShapeSelector
          selectedShapes={filters.shapes}
          onShapeToggle={(shape) => toggleFilter('shapes', shape)}
        />
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 text-lg">Price</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Min Price</label>
            <Input
              type="number"
              placeholder="$500"
              value={customPriceMin}
              onChange={(e) => setCustomPriceMin(e.target.value)}
              onBlur={handlePriceUpdate}
              className="text-center"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Max Price</label>
            <Input
              type="number"
              placeholder="$50,000"
              value={customPriceMax}
              onChange={(e) => setCustomPriceMax(e.target.value)}
              onBlur={handlePriceUpdate}
              className="text-center"
            />
          </div>
        </div>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onUpdateFilter('priceRange', value as [number, number])}
            max={maxPrice}
            min={minPrice}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-slate-600 mt-1">
            <span>${filters.priceRange[0].toLocaleString()}</span>
            <span>${filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Carat Range */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 text-lg">Carat</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Min Carat</label>
            <Input
              type="number"
              placeholder="1.00"
              value={customCaratMin}
              onChange={(e) => setCustomCaratMin(e.target.value)}
              onBlur={handleCaratUpdate}
              className="text-center"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Max Carat</label>
            <Input
              type="number"
              placeholder="20.00"
              value={customCaratMax}
              onChange={(e) => setCustomCaratMax(e.target.value)}
              onBlur={handleCaratUpdate}
              className="text-center"
              step="0.01"
            />
          </div>
        </div>
        <div className="px-2">
          <Slider
            value={filters.caratRange}
            onValueChange={(value) => onUpdateFilter('caratRange', value as [number, number])}
            max={maxCarat}
            min={minCarat}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-slate-600 mt-1">
            <span>{filters.caratRange[0].toFixed(1)} ct</span>
            <span>{filters.caratRange[1].toFixed(1)} ct</span>
          </div>
        </div>
      </div>

      {/* Color Scroller */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 text-lg">Color</h4>
        <ColorScroller
          selectedColors={filters.colors}
          onColorToggle={(color) => toggleFilter('colors', color)}
        />
      </div>

      {/* Clarity Scroller */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 text-lg">Clarity</h4>
        <ClarityScroller
          selectedClarities={filters.clarities}
          onClarityToggle={(clarity) => toggleFilter('clarities', clarity)}
        />
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-slate-600">{activeFiltersCount} filters active</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter Diamonds</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <FilterContent />
    </div>
  );
}
