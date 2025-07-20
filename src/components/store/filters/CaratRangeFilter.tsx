
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
      
      <div className="space-y-3">
        <div className="px-1">
          <Slider
            value={caratRange}
            onValueChange={(value) => onCaratRangeChange(value as [number, number])}
            max={maxCarat}
            min={minCarat}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{caratRange[0].toFixed(2)} ct</span>
            <span>{caratRange[1].toFixed(2)} ct</span>
          </div>
        </div>
      </div>
    </div>
  );
}
