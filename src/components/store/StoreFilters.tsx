
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface StoreFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  className?: string;
}

const SHAPES = [
  'Round', 'Princess', 'Emerald', 'Asscher', 'Oval', 'Radiant',
  'Cushion', 'Pear', 'Heart', 'Marquise'
];

const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];

const CUTS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

export function StoreFilters({ filters, onFilterChange, onClearFilters, className }: StoreFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    shape: true,
    color: true,
    clarity: true,
    carat: true,
    price: true,
    cut: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasActiveFilters = 
    filters.shape.length > 0 ||
    filters.clarity.length > 0 ||
    filters.cut.length > 0 ||
    filters.color[0] !== 'D' ||
    filters.color[1] !== 'Z' ||
    filters.carat[0] !== 0.3 ||
    filters.carat[1] !== 10 ||
    filters.price[0] !== 500 ||
    filters.price[1] !== 100000;

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shape Filter */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-medium"
              onClick={() => toggleSection('shape')}
            >
              Shape {filters.shape.length > 0 && <Badge variant="secondary">{filters.shape.length}</Badge>}
            </Button>
            {expandedSections.shape && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SHAPES.map((shape) => (
                  <div key={shape} className="flex items-center space-x-2">
                    <Checkbox
                      id={shape}
                      checked={filters.shape.includes(shape)}
                      onCheckedChange={(checked) => {
                        const newShapes = checked
                          ? [...filters.shape, shape]
                          : filters.shape.filter((s: string) => s !== shape);
                        onFilterChange({ shape: newShapes });
                      }}
                    />
                    <label htmlFor={shape} className="text-sm">{shape}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color Filter */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-medium"
              onClick={() => toggleSection('color')}
            >
              Color {filters.color[0] !== 'D' || filters.color[1] !== 'Z' ? <Badge variant="secondary">{filters.color[0]}-{filters.color[1]}</Badge> : null}
            </Button>
            {expandedSections.color && (
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{filters.color[0]} (Best)</span>
                  <span>{filters.color[1]} (Good)</span>
                </div>
                <Slider
                  value={[COLORS.indexOf(filters.color[0]), COLORS.indexOf(filters.color[1])]}
                  onValueChange={(value) => {
                    onFilterChange({ color: [COLORS[value[0]], COLORS[value[1]]] });
                  }}
                  max={COLORS.length - 1}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Clarity Filter */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-medium"
              onClick={() => toggleSection('clarity')}
            >
              Clarity {filters.clarity.length > 0 && <Badge variant="secondary">{filters.clarity.length}</Badge>}
            </Button>
            {expandedSections.clarity && (
              <div className="mt-3 space-y-2">
                {CLARITIES.map((clarity) => (
                  <div key={clarity} className="flex items-center space-x-2">
                    <Checkbox
                      id={clarity}
                      checked={filters.clarity.includes(clarity)}
                      onCheckedChange={(checked) => {
                        const newClarities = checked
                          ? [...filters.clarity, clarity]
                          : filters.clarity.filter((c: string) => c !== clarity);
                        onFilterChange({ clarity: newClarities });
                      }}
                    />
                    <label htmlFor={clarity} className="text-sm">{clarity}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carat Filter */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-medium"
              onClick={() => toggleSection('carat')}
            >
              Carat Weight {filters.carat[0] !== 0.3 || filters.carat[1] !== 10 ? <Badge variant="secondary">{filters.carat[0]}-{filters.carat[1]}ct</Badge> : null}
            </Button>
            {expandedSections.carat && (
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{filters.carat[0]}ct</span>
                  <span>{filters.carat[1]}ct</span>
                </div>
                <Slider
                  value={filters.carat}
                  onValueChange={(value) => onFilterChange({ carat: value })}
                  min={0.3}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-medium"
              onClick={() => toggleSection('price')}
            >
              Price {filters.price[0] !== 500 || filters.price[1] !== 100000 ? <Badge variant="secondary">{formatPrice(filters.price[0])}-{formatPrice(filters.price[1])}</Badge> : null}
            </Button>
            {expandedSections.price && (
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{formatPrice(filters.price[0])}</span>
                  <span>{formatPrice(filters.price[1])}</span>
                </div>
                <Slider
                  value={filters.price}
                  onValueChange={(value) => onFilterChange({ price: value })}
                  min={500}
                  max={100000}
                  step={500}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Cut Filter */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-medium"
              onClick={() => toggleSection('cut')}
            >
              Cut {filters.cut.length > 0 && <Badge variant="secondary">{filters.cut.length}</Badge>}
            </Button>
            {expandedSections.cut && (
              <div className="mt-3 space-y-2">
                {CUTS.map((cut) => (
                  <div key={cut} className="flex items-center space-x-2">
                    <Checkbox
                      id={cut}
                      checked={filters.cut.includes(cut)}
                      onCheckedChange={(checked) => {
                        const newCuts = checked
                          ? [...filters.cut, cut]
                          : filters.cut.filter((c: string) => c !== cut);
                        onFilterChange({ cut: newCuts });
                      }}
                    />
                    <label htmlFor={cut} className="text-sm">{cut}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
