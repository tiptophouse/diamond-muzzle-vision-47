
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface PriceRangeFilterProps {
  priceRange: [number, number];
  minPrice: number;
  maxPrice: number;
  onPriceRangeChange: (range: [number, number]) => void;
}

export function PriceRangeFilter({ 
  priceRange, 
  minPrice, 
  maxPrice, 
  onPriceRangeChange 
}: PriceRangeFilterProps) {
  return (
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
              inputMode="numeric"
              placeholder="$1,000"
              className="h-12 touch-target text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              value={priceRange[0] || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : minPrice;
                onPriceRangeChange([value, priceRange[1]]);
              }}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">Max Price</label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="$100,000"
              className="h-12 touch-target text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              value={priceRange[1] || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : maxPrice;
                onPriceRangeChange([priceRange[0], value]);
              }}
            />
          </div>
        </div>
        
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            max={maxPrice}
            min={minPrice}
            step={1000}
            className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
