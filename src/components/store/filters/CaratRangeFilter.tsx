
import { Diamond } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface CaratRangeFilterProps {
  caratRange: [number, number];
  minCarat: number;
  maxCarat: number;
  onCaratRangeChange: (range: [number, number]) => void;
}

export function CaratRangeFilter({ 
  caratRange, 
  minCarat, 
  maxCarat, 
  onCaratRangeChange 
}: CaratRangeFilterProps) {
  return (
    <div className="space-y-3 bg-card p-3 rounded-lg border">
      <div className="flex items-center gap-2">
        <Diamond className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-medium text-foreground">Carat Weight</h3>
      </div>
      
      <div className="space-y-4">
        <div className="px-2">
          <Slider
            value={caratRange}
            onValueChange={(value) => onCaratRangeChange(value as [number, number])}
            max={maxCarat}
            min={minCarat}
            step={0.1}
            className="w-full [&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-purple-500 [&>span:first-child]:to-pink-500 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-500 [&_[role=slider]]:shadow-lg [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
          />
          <div className="flex justify-between text-sm font-medium text-foreground mt-2">
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md">{caratRange[0].toFixed(1)} ct</span>
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md">{caratRange[1].toFixed(1)} ct</span>
          </div>
        </div>
      </div>
    </div>
  );
}
