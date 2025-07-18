
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
    <div className="space-y-3 bg-card p-3 rounded-lg border">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-medium text-foreground">Price Range</h3>
      </div>
      
      <div className="space-y-3">
        <div className="px-1">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            max={maxPrice}
            min={minPrice}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
