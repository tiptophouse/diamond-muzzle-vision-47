import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Diamond } from '@/types/diamond';

interface FigmaStoreFiltersProps {
  diamonds: Diamond[];
  onFilter: (filters: any) => void;
}

export function FigmaStoreFilters({ diamonds, onFilter }: FigmaStoreFiltersProps) {
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [caratRange, setCaratRange] = useState<number[]>([0, 5]);
  const [shapeFilters, setShapeFilters] = useState<string[]>([]);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [clarityFilters, setClarityFilters] = useState<string[]>([]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handleCaratChange = (value: number[]) => {
    setCaratRange(value);
  };

  const handleShapeChange = (shape: string) => {
    setShapeFilters((prev) =>
      prev.includes(shape) ? prev.filter((s) => s !== shape) : [...prev, shape]
    );
  };

  const handleColorChange = (color: string) => {
    setColorFilters((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleClarityChange = (clarity: string) => {
    setClarityFilters((prev) =>
      prev.includes(clarity) ? prev.filter((c) => c !== clarity) : [...prev, clarity]
    );
  };

  const applyFilters = () => {
    const filters = {
      priceRange,
      caratRange,
      shapes: shapeFilters,
      colors: colorFilters,
      clarities: clarityFilters,
    };
    onFilter(filters);
  };

  const resetFilters = () => {
    setPriceRange([0, 10000]);
    setCaratRange([0, 5]);
    setShapeFilters([]);
    setColorFilters([]);
    setClarityFilters([]);
    applyFilters();
  };

  const allShapes = Array.from(new Set(diamonds.map((d) => d.shape)));
  const allColors = Array.from(new Set(diamonds.map((d) => d.color)));
  const allClarities = Array.from(new Set(diamonds.map((d) => d.clarity)));

  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Price Range</h4>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([parseInt(e.target.value), priceRange[1]])
              }
              className="w-24"
            />
            <span>-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], parseInt(e.target.value)])
              }
              className="w-24"
            />
          </div>
          <Slider
            min={0}
            max={10000}
            step={100}
            value={priceRange}
            onValueChange={handlePriceChange}
          />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Carat Range</h4>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={caratRange[0]}
              onChange={(e) =>
                setCaratRange([parseInt(e.target.value), caratRange[1]])
              }
              className="w-20"
            />
            <span>-</span>
            <Input
              type="number"
              value={caratRange[1]}
              onChange={(e) =>
                setCaratRange([caratRange[0], parseInt(e.target.value)])
              }
              className="w-20"
            />
          </div>
          <Slider
            min={0}
            max={5}
            step={0.1}
            value={caratRange}
            onValueChange={handleCaratChange}
          />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Shape</h4>
          <ScrollArea className="h-40">
            <div className="space-y-1">
              {allShapes.map((shape) => (
                <div key={shape} className="flex items-center space-x-2">
                  <Checkbox
                    id={`shape-${shape}`}
                    checked={shapeFilters.includes(shape)}
                    onCheckedChange={() => handleShapeChange(shape)}
                  />
                  <Label htmlFor={`shape-${shape}`}>{shape}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Color</h4>
          <ScrollArea className="h-40">
            <div className="space-y-1">
              {allColors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={colorFilters.includes(color)}
                    onCheckedChange={() => handleColorChange(color)}
                  />
                  <Label htmlFor={`color-${color}`}>{color}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Clarity</h4>
          <ScrollArea className="h-40">
            <div className="space-y-1">
              {allClarities.map((clarity) => (
                <div key={clarity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`clarity-${clarity}`}
                    checked={clarityFilters.includes(clarity)}
                    onCheckedChange={() => handleClarityChange(clarity)}
                  />
                  <Label htmlFor={`clarity-${clarity}`}>{clarity}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
          <Button size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
