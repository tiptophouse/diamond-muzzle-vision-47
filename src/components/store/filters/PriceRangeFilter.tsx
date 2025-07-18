
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
      
      <div className="space-y-4">
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            max={maxPrice}
            min={minPrice}
            step={1000}
            className="w-full [&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-500 [&>span:first-child]:to-purple-500 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-blue-500 [&_[role=slider]]:shadow-lg [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
          />
          <div className="flex justify-between text-sm font-medium text-foreground mt-2">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">${priceRange[0].toLocaleString()}</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
