
import { useState } from "react";
import { X, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Diamond } from "@/components/inventory/InventoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnhancedStoreFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
    cuts: string[];
    caratRange: [number, number];
    priceRange: [number, number];
    fluorescence: string[];
    labs: string[];
    status: string[];
    polish: string[];
    symmetry: string[];
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
const CUTS = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const FLUORESCENCE = ["None", "Faint", "Medium", "Strong", "Very Strong"];
const LABS = ["GIA", "AGS", "IGI", "GGTL", "SSEF", "Other"];
const STATUS = ["Available", "Reserved", "Sold", "On Hold"];
const POLISH = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const SYMMETRY = ["Excellent", "Very Good", "Good", "Fair", "Poor"];

export function EnhancedStoreFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  diamonds,
  isOpen = false,
  onClose,
  isMobile = false
}: EnhancedStoreFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "4cs": true,
    "pricing": true,
    "certification": false,
    "optical": false,
    "availability": false
  });

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
    filters.labs.length +
    filters.status.length +
    filters.polish.length +
    filters.symmetry.length +
    (filters.caratRange[0] > minCarat || filters.caratRange[1] < maxCarat ? 1 : 0) +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0);

  const toggleFilter = (type: string, value: string) => {
    const currentValues = filters[type as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdateFilter(type, newValues);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          <Badge variant="secondary">{diamonds.length} total</Badge>
        </div>
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
            {filters.cuts.map(cut => (
              <Badge key={cut} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('cuts', cut)}>
                {cut} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 4Cs Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle 
            className="text-sm cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('4cs')}
          >
            The 4Cs
            <span className="text-xs">{expandedSections['4cs'] ? '−' : '+'}</span>
          </CardTitle>
        </CardHeader>
        {expandedSections['4cs'] && (
          <CardContent className="space-y-4">
            {/* Shape */}
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

            {/* Carat Weight */}
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

            {/* Color */}
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

            {/* Clarity */}
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

            {/* Cut */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Cut Quality</h4>
              <div className="grid grid-cols-2 gap-2">
                {CUTS.map(cut => (
                  <label key={cut} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.cuts.includes(cut)}
                      onCheckedChange={() => toggleFilter('cuts', cut)}
                    />
                    <span className="text-sm text-slate-700">{cut}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pricing Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle 
            className="text-sm cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('pricing')}
          >
            Pricing
            <span className="text-xs">{expandedSections['pricing'] ? '−' : '+'}</span>
          </CardTitle>
        </CardHeader>
        {expandedSections['pricing'] && (
          <CardContent>
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
          </CardContent>
        )}
      </Card>

      {/* Certification Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle 
            className="text-sm cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('certification')}
          >
            Certification & Lab
            <span className="text-xs">{expandedSections['certification'] ? '−' : '+'}</span>
          </CardTitle>
        </CardHeader>
        {expandedSections['certification'] && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Laboratory</h4>
              <div className="grid grid-cols-2 gap-2">
                {LABS.map(lab => (
                  <label key={lab} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.labs.includes(lab)}
                      onCheckedChange={() => toggleFilter('labs', lab)}
                    />
                    <span className="text-sm text-slate-700">{lab}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Optical Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle 
            className="text-sm cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('optical')}
          >
            Optical Properties
            <span className="text-xs">{expandedSections['optical'] ? '−' : '+'}</span>
          </CardTitle>
        </CardHeader>
        {expandedSections['optical'] && (
          <CardContent className="space-y-4">
            {/* Fluorescence */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Fluorescence</h4>
              <div className="grid grid-cols-2 gap-2">
                {FLUORESCENCE.map(fluor => (
                  <label key={fluor} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.fluorescence.includes(fluor)}
                      onCheckedChange={() => toggleFilter('fluorescence', fluor)}
                    />
                    <span className="text-sm text-slate-700">{fluor}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Polish */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Polish</h4>
              <div className="grid grid-cols-2 gap-2">
                {POLISH.map(polish => (
                  <label key={polish} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.polish.includes(polish)}
                      onCheckedChange={() => toggleFilter('polish', polish)}
                    />
                    <span className="text-sm text-slate-700">{polish}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Symmetry */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Symmetry</h4>
              <div className="grid grid-cols-2 gap-2">
                {SYMMETRY.map(symmetry => (
                  <label key={symmetry} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.symmetry.includes(symmetry)}
                      onCheckedChange={() => toggleFilter('symmetry', symmetry)}
                    />
                    <span className="text-sm text-slate-700">{symmetry}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle 
            className="text-sm cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('availability')}
          >
            Availability
            <span className="text-xs">{expandedSections['availability'] ? '−' : '+'}</span>
          </CardTitle>
        </CardHeader>
        {expandedSections['availability'] && (
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {STATUS.map(status => (
                  <label key={status} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.status.includes(status)}
                      onCheckedChange={() => toggleFilter('status', status)}
                    />
                    <span className="text-sm text-slate-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <FilterContent />
    </div>
  );
}
