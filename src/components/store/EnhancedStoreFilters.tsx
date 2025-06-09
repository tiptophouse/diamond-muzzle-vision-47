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
  filters: any;
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  diamonds: Diamond[];
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function EnhancedStoreFilters({
  filters,
  onUpdateFilter,
  onClearFilters,
  diamonds = [],
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get unique string values from diamonds array safely
  const getUniqueStringValues = (key: keyof Diamond): string[] => {
    if (!diamonds || diamonds.length === 0) return [];
    return [...new Set(diamonds
      .map(d => d[key])
      .filter(Boolean)
      .map(value => String(value))
    )].sort();
  };

  const shapes = getUniqueStringValues('shape');
  const colors = getUniqueStringValues('color');
  const clarities = getUniqueStringValues('clarity');
  const cuts = getUniqueStringValues('cut');
  const statuses = getUniqueStringValues('status');
  
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
    <Card className="mb-4">
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => toggleSection(filterKey)}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          {expandedSections[filterKey] ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </CardTitle>
      </CardHeader>
      
      {expandedSections[filterKey] && (
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
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
                />
                <label
                  htmlFor={`${filterKey}-${option}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
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
    <Card className="mb-4">
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => toggleSection(filterKey)}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          {expandedSections[filterKey] ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </CardTitle>
      </CardHeader>
      
      {expandedSections[filterKey] && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{formatValue(range[0])}</span>
              <span>{formatValue(range[1])}</span>
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
    <div className="space-y-4">
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">{activeFiltersCount} active filters</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        </div>
      )}

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
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
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
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Diamonds
        </h3>
      </div>
      <FilterContent />
    </div>
  );
}
