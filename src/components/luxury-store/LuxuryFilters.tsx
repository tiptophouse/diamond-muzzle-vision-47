
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LuxuryStoreFilters } from "@/pages/LuxuryStorePage";

interface LuxuryFiltersProps {
  filters: LuxuryStoreFilters;
  onFilterChange: (filters: Partial<LuxuryStoreFilters>) => void;
  onClearFilters: () => void;
  className?: string;
}

export function LuxuryFilters({ filters, onFilterChange, onClearFilters, className }: LuxuryFiltersProps) {
  const shapes = ['Round', 'Princess', 'Cushion', 'Emerald', 'Oval', 'Radiant', 'Asscher', 'Marquise', 'Heart', 'Pear'];
  const clarityOptions = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
  const cutOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className={`bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-light text-slate-900">Filters</CardTitle>
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-slate-600 hover:text-slate-900 text-sm"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Shape Filter */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Shape</h3>
          <div className="grid grid-cols-2 gap-2">
            {shapes.map((shape) => (
              <div key={shape} className="flex items-center space-x-2">
                <Checkbox
                  id={shape}
                  checked={filters.shape.includes(shape)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFilterChange({ shape: [...filters.shape, shape] });
                    } else {
                      onFilterChange({ shape: filters.shape.filter(s => s !== shape) });
                    }
                  }}
                />
                <label htmlFor={shape} className="text-sm text-slate-700 cursor-pointer">
                  {shape}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-200" />

        {/* Carat Range */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Carat Weight</h3>
          <div className="px-2">
            <Slider
              value={filters.carat}
              onValueChange={(value) => onFilterChange({ carat: value as [number, number] })}
              max={10}
              min={0.3}
              step={0.1}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-slate-600">
              <span>{filters.carat[0]} ct</span>
              <span>{filters.carat[1]} ct</span>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-200" />

        {/* Price Range */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Price Range</h3>
          <div className="px-2">
            <Slider
              value={filters.price}
              onValueChange={(value) => onFilterChange({ price: value as [number, number] })}
              max={100000}
              min={500}
              step={1000}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-slate-600">
              <span>{formatPrice(filters.price[0])}</span>
              <span>{formatPrice(filters.price[1])}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-200" />

        {/* Color Range */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Color Grade</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{filters.color[0]}</span>
            <span>to</span>
            <span>{filters.color[1]}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">D (Colorless) to Z (Light Yellow)</p>
        </div>

        <Separator className="bg-slate-200" />

        {/* Clarity Filter */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Clarity</h3>
          <div className="grid grid-cols-3 gap-2">
            {clarityOptions.map((clarity) => (
              <div key={clarity} className="flex items-center space-x-2">
                <Checkbox
                  id={clarity}
                  checked={filters.clarity.includes(clarity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFilterChange({ clarity: [...filters.clarity, clarity] });
                    } else {
                      onFilterChange({ clarity: filters.clarity.filter(c => c !== clarity) });
                    }
                  }}
                />
                <label htmlFor={clarity} className="text-sm text-slate-700 cursor-pointer">
                  {clarity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-200" />

        {/* Cut Filter */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Cut Quality</h3>
          <div className="space-y-2">
            {cutOptions.map((cut) => (
              <div key={cut} className="flex items-center space-x-2">
                <Checkbox
                  id={cut}
                  checked={filters.cut.includes(cut)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFilterChange({ cut: [...filters.cut, cut] });
                    } else {
                      onFilterChange({ cut: filters.cut.filter(c => c !== cut) });
                    }
                  }}
                />
                <label htmlFor={cut} className="text-sm text-slate-700 cursor-pointer">
                  {cut}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
