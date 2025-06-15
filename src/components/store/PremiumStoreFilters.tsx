
import { useState } from "react";
import { RotateCcw, ChevronDown, Diamond, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Diamond as DiamondType } from "@/components/inventory/InventoryTable";
import { ShapeSelector } from "./ShapeSelector";

interface PremiumStoreFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Shape Filter */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <Diamond className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Shape</h3>
        </div>
        <ShapeSelector
          selectedShapes={filters.shapes}
          onShapeToggle={(shape) => toggleFilter('shapes', shape)}
        />
      </div>

      {/* Main Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Price Range */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Price Range</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">Min Price</label>
                <Input
                  type="number"
                  placeholder="$1,000"
                  className="h-10 text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  value={filters.priceRange[0] || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : minPrice;
                    onUpdateFilter('priceRange', [value, filters.priceRange[1]]);
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">Max Price</label>
                <Input
                  type="number"
                  placeholder="$100,000"
                  className="h-10 text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : maxPrice;
                    onUpdateFilter('priceRange', [filters.priceRange[0], value]);
                  }}
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
                className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>${filters.priceRange[0].toLocaleString()}</span>
                <span>${filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carat Range */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Diamond className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Carat Weight</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">Min Carat</label>
                <Input
                  type="number"
                  placeholder="0.50"
                  className="h-10 text-sm border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                  step="0.01"
                  value={filters.caratRange[0] || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : minCarat;
                    onUpdateFilter('caratRange', [value, filters.caratRange[1]]);
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">Max Carat</label>
                <Input
                  type="number"
                  placeholder="5.00"
                  className="h-10 text-sm border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                  step="0.01"
                  value={filters.caratRange[1] || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : maxCarat;
                    onUpdateFilter('caratRange', [filters.caratRange[0], value]);
                  }}
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
                className="w-full [&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>{filters.caratRange[0].toFixed(1)} ct</span>
                <span>{filters.caratRange[1].toFixed(1)} ct</span>
              </div>
            </div>
          </div>
        </div>

        {/* Color */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-slate-300 to-white border border-slate-300 rounded-full" />
            <h3 className="font-semibold text-slate-900">Color Grade</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Button
                key={color}
                variant={filters.colors.includes(color) ? "default" : "outline"}
                size="sm"
                className={`w-10 h-10 p-0 text-sm font-medium transition-all ${
                  filters.colors.includes(color) 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg scale-110" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
                onClick={() => toggleFilter('colors', color)}
              >
                {color}
              </Button>
            ))}
          </div>
        </div>

        {/* Clarity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-slate-900">Clarity Grade</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {clarities.map((clarity) => (
              <Button
                key={clarity}
                variant={filters.clarities.includes(clarity) ? "default" : "outline"}
                size="sm"
                className={`px-3 h-10 text-xs font-medium transition-all ${
                  filters.clarities.includes(clarity) 
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg scale-105" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
                onClick={() => toggleFilter('clarities', clarity)}
              >
                {clarity}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
