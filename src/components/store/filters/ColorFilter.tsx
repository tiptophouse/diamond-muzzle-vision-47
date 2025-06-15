
import { Button } from "@/components/ui/button";

interface ColorFilterProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

export function ColorFilter({ selectedColors, onColorToggle }: ColorFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gradient-to-r from-slate-300 to-white border border-slate-300 rounded-full" />
        <h3 className="font-semibold text-slate-900">Color Grade</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => (
          <Button
            key={color}
            variant={selectedColors.includes(color) ? "default" : "outline"}
            size="sm"
            className={`w-10 h-10 p-0 text-sm font-medium transition-all ${
              selectedColors.includes(color) 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg scale-110" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
            onClick={() => onColorToggle(color)}
          >
            {color}
          </Button>
        ))}
      </div>
    </div>
  );
}
