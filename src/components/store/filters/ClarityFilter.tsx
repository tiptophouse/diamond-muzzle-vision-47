
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClarityFilterProps {
  selectedClarities: string[];
  onClarityToggle: (clarity: string) => void;
}

const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];

export function ClarityFilter({ selectedClarities, onClarityToggle }: ClarityFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-600" />
        <h3 className="font-semibold text-slate-900">Clarity Grade</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {CLARITIES.map((clarity) => (
          <Button
            key={clarity}
            type="button"
            variant={selectedClarities.includes(clarity) ? "default" : "outline"}
            size="sm"
            className={`px-3 h-10 text-xs font-medium transition-all ${
              selectedClarities.includes(clarity) 
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg scale-105" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClarityToggle(clarity);
            }}
          >
            {clarity}
          </Button>
        ))}
      </div>
    </div>
  );
}
