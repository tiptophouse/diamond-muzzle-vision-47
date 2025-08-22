import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { Diamond } from '@/types/diamond';

interface HorizontalStoreFiltersProps {
  onFilterChange: (filters: { [key: string]: string | number | boolean }) => void;
  onClearFilters: () => void;
  availableFilters: {
    shape: string[];
    color: string[];
    clarity: string[];
    cut: string[];
    priceRange: { min: number; max: number };
    caratRange: { min: number; max: number };
  };
}

export function HorizontalStoreFilters({
  onFilterChange,
  onClearFilters,
  availableFilters,
}: HorizontalStoreFiltersProps) {
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedClarity, setSelectedClarity] = useState<string | null>(null);
  const [selectedCut, setSelectedCut] = useState<string | null>(null);

  const handleShapeChange = (shape: string) => {
    setSelectedShape(shape);
    onFilterChange({ shape });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onFilterChange({ color });
  };

  const handleClarityChange = (clarity: string) => {
    setSelectedClarity(clarity);
    onFilterChange({ clarity });
  };

  const handleCutChange = (cut: string) => {
    setSelectedCut(cut);
    onFilterChange({ cut });
  };

  const clearAllFilters = () => {
    setSelectedShape(null);
    setSelectedColor(null);
    setSelectedClarity(null);
    setSelectedCut(null);
    onClearFilters();
  };

  return (
    <div className="border-b bg-secondary">
      <ScrollArea className="w-full pb-2">
        <div className="flex w-max items-center space-x-2 px-4">
          {availableFilters && availableFilters.shape && (
            <>
              {availableFilters.shape.map((shape) => (
                <Badge
                  key={shape}
                  variant={selectedShape === shape ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleShapeChange(shape)}
                >
                  {shape}
                </Badge>
              ))}
            </>
          )}

          {availableFilters && availableFilters.color && (
            <>
              {availableFilters.color.map((color) => (
                <Badge
                  key={color}
                  variant={selectedColor === color ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleColorChange(color)}
                >
                  {color}
                </Badge>
              ))}
            </>
          )}

          {availableFilters && availableFilters.clarity && (
            <>
              {availableFilters.clarity.map((clarity) => (
                <Badge
                  key={clarity}
                  variant={selectedClarity === clarity ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleClarityChange(clarity)}
                >
                  {clarity}
                </Badge>
              ))}
            </>
          )}

          {availableFilters && availableFilters.cut && (
            <>
              {availableFilters.cut.map((cut) => (
                <Badge
                  key={cut}
                  variant={selectedCut === cut ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleCutChange(cut)}
                >
                  {cut}
                </Badge>
              ))}
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Additional Filters</SheetTitle>
              </SheetHeader>
              <p className="text-sm text-muted-foreground">
                This is where you can add more filters in the future.
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </ScrollArea>
      <div className="flex justify-end px-4 py-2">
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>
    </div>
  );
}
