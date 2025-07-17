
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClarityFilterProps {
  selectedClarities: string[];
  onClarityToggle: (clarity: string) => void;
}

const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];

export function ClarityFilter({ selectedClarities, onClarityToggle }: ClarityFilterProps) {
  return (
    <div className="space-y-3 bg-card p-3 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Clarity</h3>
        {selectedClarities.length > 0 && (
          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
            {selectedClarities.length}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {CLARITIES.map((clarity) => (
          <button
            key={clarity}
            onClick={() => onClarityToggle(clarity)}
            className={`px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all min-h-[44px] touch-target ${
              selectedClarities.includes(clarity)
                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-primary/40"
            }`}
          >
            {clarity}
          </button>
        ))}
      </div>
    </div>
  );
}
