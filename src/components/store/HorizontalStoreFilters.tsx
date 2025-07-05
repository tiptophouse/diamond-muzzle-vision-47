
import { useState } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Diamond } from "@/components/inventory/InventoryTable";
import { ShapeSelector } from "./ShapeSelector";

interface HorizontalStoreFiltersProps {
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
  diamonds: Diamond[];
}

export function HorizontalStoreFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  diamonds
}: HorizontalStoreFiltersProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];
  const cuts = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const fluorescenceOptions = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];

  return (
    <div className="bg-white space-y-6">
      {/* Shape Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          Shape
          <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</span>
        </h4>
        <ShapeSelector
          selectedShapes={filters.shapes}
          onShapeToggle={(shape) => toggleFilter('shapes', shape)}
        />
      </div>

      {/* Horizontal Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Price Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            Price
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
              <Input
                type="number"
                placeholder="$2000"
                className="h-8 text-sm"
                value={filters.priceRange[0] || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : minPrice;
                  onUpdateFilter('priceRange', [value, filters.priceRange[1]]);
                }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
              <Input
                type="number"
                placeholder="$5,000,000"
                className="h-8 text-sm"
                value={filters.priceRange[1] || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : maxPrice;
                  onUpdateFilter('priceRange', [filters.priceRange[0], value]);
                }}
              />
            </div>
          </div>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onUpdateFilter('priceRange', value as [number, number])}
            max={maxPrice}
            min={minPrice}
            step={1000}
            className="w-full"
          />
        </div>

        {/* Carat Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            Carat
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Min Carat</label>
              <Input
                type="number"
                placeholder="1.00"
                className="h-8 text-sm"
                step="0.01"
                value={filters.caratRange[0] || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : minCarat;
                  onUpdateFilter('caratRange', [value, filters.caratRange[1]]);
                }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Max Carat</label>
              <Input
                type="number"
                placeholder="10.00"
                className="h-8 text-sm"
                step="0.01"
                value={filters.caratRange[1] || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : maxCarat;
                  onUpdateFilter('caratRange', [filters.caratRange[0], value]);
                }}
              />
            </div>
          </div>
          <Slider
            value={filters.caratRange}
            onValueChange={(value) => onUpdateFilter('caratRange', value as [number, number])}
            max={maxCarat}
            min={minCarat}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Cut Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            Cut
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</span>
          </h4>
          <div className="flex flex-wrap gap-1">
            {cuts.map((cut) => (
              <Button
                key={cut}
                variant={filters.cuts.includes(cut) ? "default" : "outline"}
                size="sm"
                className={`h-8 px-3 text-xs ${
                  filters.cuts.includes(cut) 
                    ? "bg-blue-600 text-white" 
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => toggleFilter('cuts', cut)}
              >
                {cut}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Color, Clarity and Fluorescence Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Color Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            Color
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</span>
          </h4>
          <div className="flex gap-1">
            {colors.map((color) => (
              <Button
                key={color}
                variant={filters.colors.includes(color) ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 text-xs ${
                  filters.colors.includes(color) 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => toggleFilter('colors', color)}
              >
                {color}
              </Button>
            ))}
          </div>
        </div>

        {/* Clarity Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            Clarity
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</span>
          </h4>
          <div className="flex gap-1">
            {clarities.map((clarity) => (
              <Button
                key={clarity}
                variant={filters.clarities.includes(clarity) ? "default" : "outline"}
                size="sm"
                className={`h-8 px-2 text-xs ${
                  filters.clarities.includes(clarity) 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => toggleFilter('clarities', clarity)}
              >
                {clarity}
              </Button>
            ))}
          </div>
        </div>

        {/* Fluorescence Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            Fluorescence
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</span>
          </h4>
          <div className="flex flex-wrap gap-1">
            {fluorescenceOptions.map((fluorescence) => (
              <Button
                key={fluorescence}
                variant={filters.fluorescence.includes(fluorescence) ? "default" : "outline"}
                size="sm"
                className={`h-8 px-2 text-xs ${
                  filters.fluorescence.includes(fluorescence) 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => toggleFilter('fluorescence', fluorescence)}
              >
                {fluorescence}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Shipment and Reset */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="rounded" />
            Quick Shipment
          </label>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>
        <Button 
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Advanced Filters +
        </Button>
      </div>
    </div>
  );
}
