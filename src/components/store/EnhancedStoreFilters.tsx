
import { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Diamond } from "@/components/inventory/InventoryTable";

interface EnhancedStoreFiltersProps {
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  totalDiamonds: number;
  filteredCount: number;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function EnhancedStoreFilters({
  onUpdateFilter,
  onClearFilters,
  totalDiamonds,
  filteredCount,
  isOpen = false,
  onClose,
  isMobile = false,
}: EnhancedStoreFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    shape: true,
    color: true,
    clarity: true,
    cut: true,
    price: true,
    carat: true,
  });

  const [filters, setFilters] = useState({
    shapes: [] as string[],
    colors: [] as string[],
    clarities: [] as string[],
    cuts: [] as string[],
    caratRange: [0, 10] as [number, number],
    priceRange: [0, 100000] as [number, number],
    fluorescence: [] as string[],
    labs: [] as string[],
    status: [] as string[],
    polish: [] as string[],
    symmetry: [] as string[],
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const shapes = ['Round', 'Princess', 'Cushion', 'Emerald', 'Oval', 'Pear', 'Marquise', 'Radiant', 'Asscher', 'Heart'];
  const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
  const cuts = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const statuses = ['Available', 'Sold', 'Reserved'];
  
  const labs = ['GIA', 'AGS', 'GCAL', 'EGL', 'IGI', 'SSEF', 'Other'];
  const fluorescenceOptions = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];
  const polishOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const symmetryOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

  const FilterCheckboxGroup = ({ 
    title, 
    options, 
    selected, 
    onUpdate, 
    filterKey 
  }: {
    title: string;
    options: string[];
    selected: string[];
    onUpdate: (key: string, value: string[]) => void;
    filterKey: string;
  }) => (
    <Card className="mb-4 shadow-sm border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-lg"
        onClick={() => toggleSection(filterKey)}
      >
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-800">
          {title}
          {expandedSections[filterKey] ? 
            <ChevronUp className="h-4 w-4 text-blue-600" /> : 
            <ChevronDown className="h-4 w-4 text-slate-400" />
          }
        </CardTitle>
      </CardHeader>
      
      {expandedSections[filterKey] && (
        <CardContent className="pt-0">
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-3 hover:bg-slate-50 p-2 rounded-md transition-colors">
                <Checkbox
                  id={`${filterKey}-${option}`}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onUpdate(filterKey, [...selected, option]);
                    } else {
                      onUpdate(filterKey, selected.filter(item => item !== option));
                    }
                  }}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor={`${filterKey}-${option}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 text-slate-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );

  const RangeSlider = ({ 
    title, 
    range, 
    min, 
    max, 
    step = 0.1, 
    onUpdate, 
    filterKey,
    formatValue = (v: number) => v.toString()
  }: {
    title: string;
    range: [number, number];
    min: number;
    max: number;
    step?: number;
    onUpdate: (key: string, value: [number, number]) => void;
    filterKey: string;
    formatValue?: (value: number) => string;
  }) => (
    <Card className="mb-4 shadow-sm border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-lg"
        onClick={() => toggleSection(filterKey)}
      >
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-800">
          {title}
          {expandedSections[filterKey] ? 
            <ChevronUp className="h-4 w-4 text-blue-600" /> : 
            <ChevronDown className="h-4 w-4 text-slate-400" />
          }
        </CardTitle>
      </CardHeader>
      
      {expandedSections[filterKey] && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600 font-medium">
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{formatValue(range[0])}</span>
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{formatValue(range[1])}</span>
            </div>
            <Slider
              value={range}
              onValueChange={(value) => onUpdate(filterKey, value as [number, number])}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );

  const activeFiltersCount = Object.values(filters || {}).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return false;
    return value !== null && value !== undefined;
  }).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-900">Filter Diamonds</span>
          </div>
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="bg-white hover:bg-red-50 text-red-600 border-red-200"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-white px-3 py-1 rounded-full border">
            <span className="text-slate-600">Total: </span>
            <span className="font-semibold text-blue-600">{totalDiamonds}</span>
          </div>
          <div className="bg-white px-3 py-1 rounded-full border">
            <span className="text-slate-600">Filtered: </span>
            <span className="font-semibold text-green-600">{filteredCount}</span>
          </div>
        </div>
      </div>

      <FilterCheckboxGroup
        title="Shape"
        options={shapes}
        selected={filters?.shapes || []}
        onUpdate={onUpdateFilter}
        filterKey="shapes"
      />

      <FilterCheckboxGroup
        title="Color"
        options={colors}
        selected={filters?.colors || []}
        onUpdate={onUpdateFilter}
        filterKey="colors"
      />

      <FilterCheckboxGroup
        title="Clarity"
        options={clarities}
        selected={filters?.clarities || []}
        onUpdate={onUpdateFilter}
        filterKey="clarities"
      />

      <FilterCheckboxGroup
        title="Cut"
        options={cuts}
        selected={filters?.cuts || []}
        onUpdate={onUpdateFilter}
        filterKey="cuts"
      />

      <RangeSlider
        title="Carat Weight"
        range={filters?.caratRange || [0, 10]}
        min={0}
        max={10}
        step={0.1}
        onUpdate={onUpdateFilter}
        filterKey="caratRange"
        formatValue={(v) => `${v.toFixed(1)}ct`}
      />

      <RangeSlider
        title="Price Range"
        range={filters?.priceRange || [0, 100000]}
        min={0}
        max={100000}
        step={1000}
        onUpdate={onUpdateFilter}
        filterKey="priceRange"
        formatValue={(v) => `$${v.toLocaleString()}`}
      />

      <FilterCheckboxGroup
        title="Fluorescence"
        options={fluorescenceOptions}
        selected={filters?.fluorescence || []}
        onUpdate={onUpdateFilter}
        filterKey="fluorescence"
      />

      <FilterCheckboxGroup
        title="Certification Lab"
        options={labs}
        selected={filters?.labs || []}
        onUpdate={onUpdateFilter}
        filterKey="labs"
      />

      <FilterCheckboxGroup
        title="Polish"
        options={polishOptions}
        selected={filters?.polish || []}
        onUpdate={onUpdateFilter}
        filterKey="polish"
      />

      <FilterCheckboxGroup
        title="Symmetry"
        options={symmetryOptions}
        selected={filters?.symmetry || []}
        onUpdate={onUpdateFilter}
        filterKey="symmetry"
      />

      <FilterCheckboxGroup
        title="Availability"
        options={statuses}
        selected={filters?.status || []}
        onUpdate={onUpdateFilter}
        filterKey="status"
      />
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-slate-900">
              <Filter className="h-5 w-5 text-blue-600" />
              Filter Diamonds
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6">
        <FilterContent />
      </div>
    </div>
  );
}
