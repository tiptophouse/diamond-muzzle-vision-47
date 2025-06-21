
import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Diamond } from "@/components/inventory/InventoryTable";

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

const SHAPES = ["Round", "Princess", "Oval", "Emerald", "Cushion", "Pear", "Marquise", "Asscher", "Radiant", "Heart"];
const COLORS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1"];

export function StoreFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  diamonds,
  isOpen = false,
  onClose,
  isMobile = false
}: StoreFiltersProps) {
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

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Clear Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.shapes.map(shape => (
              <Badge key={shape} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('shapes', shape)}>
                {shape} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.colors.map(color => (
              <Badge key={color} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('colors', color)}>
                {color} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.clarities.map(clarity => (
              <Badge key={clarity} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('clarities', clarity)}>
                {clarity} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Shape Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900">Shape</h4>
        <div className="grid grid-cols-2 gap-2">
          {SHAPES.map(shape => (
            <label key={shape} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.shapes.includes(shape)}
                onCheckedChange={() => toggleFilter('shapes', shape)}
              />
              <span className="text-sm text-slate-700">{shape}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900">Color</h4>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map(color => (
            <label key={color} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.colors.includes(color)}
                onCheckedChange={() => toggleFilter('colors', color)}
              />
              <span className="text-sm text-slate-700">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clarity Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900">Clarity</h4>
        <div className="grid grid-cols-3 gap-2">
          {CLARITIES.map(clarity => (
            <label key={clarity} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.clarities.includes(clarity)}
                onCheckedChange={() => toggleFilter('clarities', clarity)}
              />
              <span className="text-sm text-slate-700">{clarity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Carat Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900">Carat Weight</h4>
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

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900">Price Range</h4>
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
