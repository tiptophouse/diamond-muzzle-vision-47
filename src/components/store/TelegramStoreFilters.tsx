import React, { useState } from 'react';
import { Diamond } from '@/types/diamond';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, X } from "lucide-react";
import { ShapeFilter } from "./filters/ShapeFilter";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { CaratRangeFilter } from "./filters/CaratRangeFilter";
import { ColorFilter } from "./filters/ColorFilter";
import { ClarityFilter } from "./filters/ClarityFilter";
import { CutFilter } from "./filters/CutFilter";
import { FluorescenceFilter } from "./filters/FluorescenceFilter";
import { PolishFilter } from "./filters/PolishFilter";
import { SymmetryFilter } from "./filters/SymmetryFilter";
import { ImageAvailabilityFilter } from "./filters/ImageAvailabilityFilter";

interface TelegramStoreFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
    cuts: string[];
    fluorescence: string[];
    polish: string[];
    symmetry: string[];
    caratRange: [number, number];
    priceRange: [number, number];
    depthRange: [number, number];
    tableRange: [number, number];
    hasImages: boolean;
    has360: boolean;
  };
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  diamonds: Diamond[];
  imageStats?: {
    withImages: number;
    with360: number;
    total: number;
    withoutImages: number;
    without360: number;
  };
}

export function TelegramStoreFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters,
  onApplyFilters,
  diamonds,
  imageStats
}: TelegramStoreFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const getMinMaxValues = () => {
    if (!diamonds || diamonds.length === 0) {
      return { 
        minCarat: 0, maxCarat: 10, 
        minPrice: 0, maxPrice: 100000,
      };
    }
    
    const carats = diamonds.map(d => d.carat);
    const prices = diamonds.map(d => d.price);
    
    return {
      minCarat: Math.min(...carats),
      maxCarat: Math.max(...carats),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  };

  const { minCarat, maxCarat, minPrice, maxPrice } = getMinMaxValues();

  const toggleFilter = (type: string, value: string) => {
    const currentValues = filters[type as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdateFilter(type, newValues);
  };

  const activeFiltersCount = 
    filters.shapes.length + 
    filters.colors.length + 
    filters.clarities.length + 
    filters.cuts.length + 
    filters.fluorescence.length +
    filters.polish.length +
    filters.symmetry.length +
    (filters.caratRange[0] > minCarat || filters.caratRange[1] < maxCarat ? 1 : 0) +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0) +
    (filters.hasImages ? 1 : 0) +
    (filters.has360 ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Clear button */}
          {activeFiltersCount > 0 && (
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all ({activeFiltersCount})
              </Button>
            </div>
          )}

          {/* Image Statistics - Show counts */}
          {imageStats && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
              <div className="grid grid-cols-2 gap-2">
                <div>📸 With Photos: {imageStats.withImages}</div>
                <div>🌐 With 360°: {imageStats.with360}</div>
                <div>📷 No Photos: {imageStats.withoutImages}</div>
                <div>🔄 No 360°: {imageStats.without360}</div>
              </div>
            </div>
          )}

          {/* Image Availability Filters - High Priority */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Media Availability</h4>
            <ImageAvailabilityFilter
              hasImages={filters.hasImages}
              has360={filters.has360}
              onHasImagesChange={(value) => onUpdateFilter('hasImages', value)}
              onHas360Change={(value) => onUpdateFilter('has360', value)}
            />
          </div>

          {/* Basic Filters - Always Visible */}
          
          {/* Diamond Shape */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Shape</h4>
            <ShapeFilter
              selectedShapes={filters.shapes}
              onShapeToggle={(shape) => toggleFilter('shapes', shape)}
            />
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Price Range</h4>
            <PriceRangeFilter
              priceRange={filters.priceRange}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceRangeChange={(range) => onUpdateFilter('priceRange', range)}
            />
          </div>

          {/* Carat Weight */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Carat Weight</h4>
            <CaratRangeFilter
              caratRange={filters.caratRange}
              minCarat={minCarat}
              maxCarat={maxCarat}
              onCaratRangeChange={(range) => onUpdateFilter('caratRange', range)}
            />
          </div>

          {/* Advanced Filters - Collapsible */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-0 h-auto font-semibold text-foreground hover:bg-transparent"
              >
                Advanced Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 mt-4">
              {/* Color */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Color</h4>
                <ColorFilter
                  selectedColors={filters.colors}
                  onColorToggle={(color) => toggleFilter('colors', color)}
                />
              </div>

              {/* Clarity */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Clarity</h4>
                <ClarityFilter
                  selectedClarities={filters.clarities}
                  onClarityToggle={(clarity) => toggleFilter('clarities', clarity)}
                />
              </div>

              {/* Cut */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Cut</h4>
                <CutFilter
                  selectedCuts={filters.cuts}
                  onCutToggle={(cut) => toggleFilter('cuts', cut)}
                />
              </div>

              {/* Fluorescence */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Fluorescence</h4>
                <FluorescenceFilter
                  selectedFluorescence={filters.fluorescence}
                  onFluorescenceToggle={(fluorescence) => toggleFilter('fluorescence', fluorescence)}
                />
              </div>

              {/* Polish */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Polish</h4>
                <PolishFilter
                  selectedPolish={filters.polish}
                  onPolishToggle={(polish) => toggleFilter('polish', polish)}
                />
              </div>

              {/* Symmetry */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Symmetry</h4>
                <SymmetryFilter
                  selectedSymmetry={filters.symmetry}
                  onSymmetryToggle={(symmetry) => toggleFilter('symmetry', symmetry)}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Apply Button - Fixed at bottom */}
      <div className="p-4 border-t border-border bg-background">
        <Button 
          onClick={onApplyFilters} 
          className="w-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
