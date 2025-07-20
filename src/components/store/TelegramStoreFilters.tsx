import { useState } from "react";
import { Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { ShapeSelector } from "./ShapeSelector";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

interface TelegramStoreFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
    cuts: string[];
    caratRange: [number, number];
    priceRange: [number, number];
  };
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  diamonds: Diamond[];
}

const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];
const CUTS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

export function TelegramStoreFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  diamonds 
}: TelegramStoreFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { hapticFeedback } = useTelegramWebApp();

  const getMinMaxValues = () => {
    if (!diamonds || diamonds.length === 0) {
      return { minCarat: 0.5, maxCarat: 5, minPrice: 1000, maxPrice: 100000 };
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
    (filters.caratRange[0] > minCarat || filters.caratRange[1] < maxCarat ? 1 : 0) +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0);

  const toggleArrayFilter = (type: string, value: string) => {
    hapticFeedback.selection();
    const currentValues = filters[type as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdateFilter(type, newValues);
  };

  const FilterSection = ({ title, options, filterKey }: { title: string; options: string[]; filterKey: string }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-3 text-slate-900">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {options.map(option => {
            const isSelected = (filters[filterKey as keyof typeof filters] as string[]).includes(option);
            return (
              <Button
                key={option}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleArrayFilter(filterKey, option)}
                className={`transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const RangeFilter = ({ 
    title, 
    value, 
    min, 
    max, 
    step, 
    formatValue, 
    onChange 
  }: {
    title: string;
    value: [number, number];
    min: number;
    max: number;
    step: number;
    formatValue: (val: number) => string;
    onChange: (value: [number, number]) => void;
  }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-3 text-slate-900">{title}</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>{formatValue(value[0])}</span>
            <span>{formatValue(value[1])}</span>
          </div>
          <Slider
            value={value}
            onValueChange={(newValue) => {
              hapticFeedback.selection();
              onChange(newValue as [number, number]);
            }}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Min: {formatValue(min)}</span>
            <span>Max: {formatValue(max)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Filter Trigger Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative bg-white hover:bg-slate-50 border-slate-200 transition-all duration-200 shadow-sm"
            onClick={() => hapticFeedback.impact('light')}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-blue-100 text-blue-800 text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full border-0"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-4 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold text-slate-900">
                  Filter Diamonds
                </SheetTitle>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        hapticFeedback.impact('medium');
                        onClearFilters();
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-slate-600">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                </p>
              )}
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div className="space-y-6">
                {/* Shape Filter */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-900">Diamond Shape</h3>
                    <ShapeSelector
                      selectedShapes={filters.shapes}
                      onShapeToggle={(shape) => toggleArrayFilter('shapes', shape)}
                    />
                  </CardContent>
                </Card>

                {/* Price Range */}
                <RangeFilter
                  title="Price Range"
                  value={filters.priceRange}
                  min={minPrice}
                  max={maxPrice}
                  step={500}
                  formatValue={(val) => `$${val.toLocaleString()}`}
                  onChange={(value) => onUpdateFilter('priceRange', value)}
                />

                {/* Carat Range */}
                <RangeFilter
                  title="Carat Weight"
                  value={filters.caratRange}
                  min={minCarat}
                  max={maxCarat}
                  step={0.1}
                  formatValue={(val) => `${val.toFixed(2)} ct`}
                  onChange={(value) => onUpdateFilter('caratRange', value)}
                />

                {/* Color Filter */}
                <FilterSection title="Color" options={COLORS} filterKey="colors" />

                {/* Clarity Filter */}
                <FilterSection title="Clarity" options={CLARITIES} filterKey="clarities" />

                {/* Cut Filter */}
                <FilterSection title="Cut Quality" options={CUTS} filterKey="cuts" />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <Button
                onClick={() => {
                  hapticFeedback.notification('success');
                  setIsOpen(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}