
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Diamond className="h-4 w-4 text-purple-600" />
        <h3 className="font-semibold text-slate-900">Carat Weight</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">Min Carat</label>
            <Input
              type="number"
              placeholder="0.50"
              className="h-10 text-sm border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
              step="0.01"
              value={caratRange[0] || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : minCarat;
                onCaratRangeChange([value, caratRange[1]]);
              }}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">Max Carat</label>
            <Input
              type="number"
              placeholder="5.00"
              className="h-10 text-sm border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
              step="0.01"
              value={caratRange[1] || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : maxCarat;
                onCaratRangeChange([caratRange[0], value]);
              }}
            />
          </div>
        </div>
        
        <div className="px-2">
          <Slider
            value={caratRange}
            onValueChange={(value) => onCaratRangeChange(value as [number, number])}
            max={maxCarat}
            min={minCarat}
            step={0.1}
            className="w-full [&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-600"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{caratRange[0].toFixed(1)} ct</span>
            <span>{caratRange[1].toFixed(1)} ct</span>
          </div>
        </div>
      </div>
    </div>
  );
}
